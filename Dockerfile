# ── Stage 1: Build Daml .dar ──────────────────────────────────────
FROM eclipse-temurin:17-jdk-jammy AS daml-build

RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Install Daml SDK 2.10.3
ENV DAML_HOME=/root/.daml
RUN curl -sSL https://get.daml.com/ | sh -s 2.10.3
ENV PATH="${DAML_HOME}/bin:${PATH}"

WORKDIR /build
COPY daml.yaml .
COPY daml/ daml/
RUN daml build

# Extract package ID from the built DAR
RUN daml damlc inspect-dar .daml/dist/slinky-0.1.0.dar \
    | head -1 | awk '{print $2}' > /build/package-id.txt

# ── Stage 2: Build Frontend ──────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=daml-build /build/package-id.txt .

# Bake the package ID into the Vite build
RUN VITE_DAML_PACKAGE_ID=$(cat package-id.txt) \
    VITE_CANTON_API_URL="" \
    npm run build

# ── Stage 3: Runtime ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy

RUN apt-get update && \
    apt-get install -y curl bash nginx gettext-base && \
    rm -rf /var/lib/apt/lists/*

# Install Daml SDK (needed for sandbox + json-api at runtime)
ENV DAML_HOME=/root/.daml
RUN curl -sSL https://get.daml.com/ | sh -s 2.10.3
ENV PATH="${DAML_HOME}/bin:${PATH}"

WORKDIR /app

# Copy artifacts
COPY --from=daml-build /build/.daml/dist/slinky-0.1.0.dar ./slinky.dar
COPY --from=daml-build /build/daml.yaml .
COPY --from=daml-build /build/daml/ ./daml/
COPY --from=frontend-build /build/dist ./frontend
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY start.sh .

# Fix Windows CRLF line endings and make executable
RUN sed -i 's/\r$//' start.sh /etc/nginx/nginx.conf.template && chmod +x start.sh

# JVM tuning for Railway (keep heap reasonable)
ENV JAVA_OPTS="-Xmx2g -Xms512m"

CMD ["./start.sh"]

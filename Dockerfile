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

# ── Stage 2: Build Frontend ──────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Bake the package ID into the Vite build
RUN VITE_DAML_PACKAGE_ID=2672161aaa8903d091f4dc259634a96adbd37dee2053c6c950c1350128301cd2 \
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

# JVM tuning for Railway — JAVA_TOOL_OPTIONS is respected by all Java processes
# (JAVA_OPTS is ignored by daml sandbox/json-api)
ENV JAVA_TOOL_OPTIONS="-Xmx1500m -Xms256m"

CMD ["./start.sh"]

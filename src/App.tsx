import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useHashRoute, navigate } from "./lib/router";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";

function AppContent() {
  const { user, loading } = useAuth();
  const { page, claimId } = useHashRoute();

  // Redirect to login if trying to access protected routes without auth
  useEffect(() => {
    if (!loading && !user && ["/send", "/claim", "/account"].includes(page)) {
      navigate("/login");
    }
  }, [loading, user, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-300 mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Connecting to Canton Network...</p>
        </div>
      </div>
    );
  }

  // Landing page — accessible to everyone
  if (page === "/" || page === "") {
    return <LandingPage />;
  }

  // Login page
  if (page === "/login") {
    if (user) {
      navigate("/send");
      return null;
    }
    return <Auth />;
  }

  // Protected routes — require auth
  if (!user) return null;

  return <Dashboard page={page} claimId={claimId} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

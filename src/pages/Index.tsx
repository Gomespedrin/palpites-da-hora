import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { useAuth } from "@/hooks/useAuth";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Ranking from "./Ranking";
import Admin from "./Admin";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, profile, loading, signOut, isAdmin } = useAuth();

  const handleLogout = () => {
    signOut();
    setCurrentPage("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "ranking":
        return <Ranking />;
      case "admin":
        return isAdmin ? <Admin /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ ...profile, pointsTotal: profile?.points_total || 0 }}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isAdmin={isAdmin}
      />
      {renderCurrentPage()}
    </div>
  );
};

export default Index;

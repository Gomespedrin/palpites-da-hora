import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Ranking from "./Ranking";
import { Admin } from "./Admin";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  nickname: string;
  pointsTotal: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    // Mock login - substituir por autenticação real
    const mockUser: User = {
      id: "1",
      email: email,
      nickname: "CraqueDoFlaMengo",
      pointsTotal: 85,
    };
    
    setUser(mockUser);
    toast({
      title: "Login realizado!",
      description: `Bem-vindo de volta, ${mockUser.nickname}!`,
    });
  };

  const handleRegister = async (email: string, password: string, nickname: string) => {
    // Mock register - substituir por registro real
    const newUser: User = {
      id: Date.now().toString(),
      email: email,
      nickname: nickname,
      pointsTotal: 0,
    };
    
    setUser(newUser);
    toast({
      title: "Conta criada!",
      description: `Bem-vindo ao Palpites da Hora, ${newUser.nickname}!`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
    toast({
      title: "Logout realizado",
      description: "Até a próxima!",
    });
  };

  const renderCurrentPage = () => {
    if (!user) return null;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user} />;
      case "ranking":
        return <Ranking currentUserId={user.id} />;
      case "admin":
        return <Admin />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      {renderCurrentPage()}
    </div>
  );
};

export default Index;

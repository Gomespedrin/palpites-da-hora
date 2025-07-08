import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: {
    nickname: string;
    pointsTotal: number;
  };
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

export const Header = ({ user, onLogout, currentPage, onNavigate, isAdmin }: HeaderProps) => {
  return (
    <header className="bg-gradient-primary shadow-elegant">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">⚽</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Palpites da Hora</h1>
              <p className="text-xs text-white/80">Mostre que você entende de futebol!</p>
            </div>
          </div>

          {/* User Info & Navigation */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <nav className="hidden md:flex space-x-2">
                <Button
                  variant={currentPage === "dashboard" ? "secondary" : "ghost"}
                  onClick={() => onNavigate("dashboard")}
                  className="text-white hover:bg-white/20"
                >
                  Palpites
                </Button>
                <Button
                  variant={currentPage === "ranking" ? "secondary" : "ghost"}
                  onClick={() => onNavigate("ranking")}
                  className="text-white hover:bg-white/20"
                >
                  Ranking
                </Button>
                {isAdmin && (
                  <Button
                    variant={currentPage === "admin" ? "secondary" : "ghost"}
                    onClick={() => onNavigate("admin")}
                    className="text-white hover:bg-white/20"
                  >
                    Admin
                  </Button>
                )}
              </nav>

              {/* User Points */}
              <div className="bg-white/20 rounded-lg px-3 py-2 text-white">
                <div className="text-xs">Pontos</div>
                <div className="font-bold text-lg">{user.pointsTotal}</div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right text-white">
                  <div className="font-medium">{user.nickname}</div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={onLogout}
                  className="text-white hover:bg-white/20"
                >
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && (
          <nav className="md:hidden mt-4 flex space-x-2">
            <Button
              variant={currentPage === "dashboard" ? "secondary" : "ghost"}
              onClick={() => onNavigate("dashboard")}
              className="flex-1 text-white hover:bg-white/20"
              size="sm"
            >
              Palpites
            </Button>
            <Button
              variant={currentPage === "ranking" ? "secondary" : "ghost"}
              onClick={() => onNavigate("ranking")}
              className="flex-1 text-white hover:bg-white/20"
              size="sm"
            >
              Ranking
            </Button>
            {isAdmin && (
              <Button
                variant={currentPage === "admin" ? "secondary" : "ghost"}
                onClick={() => onNavigate("admin")}
                className="flex-1 text-white hover:bg-white/20"
                size="sm"
              >
                Admin
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RankingTableProps {
  users: Array<{
    id: string;
    nickname: string;
    pointsTotal: number;
    position?: number;
  }>;
  currentUserId?: string;
}

export const RankingTable = ({ users, currentUserId }: RankingTableProps) => {
  const sortedUsers = users
    .sort((a, b) => b.pointsTotal - a.pointsTotal)
    .map((user, index) => ({
      ...user,
      position: index + 1
    }));

  const getPositionBadge = (position: number) => {
    if (position === 1) return { variant: "default" as const, icon: "🥇" };
    if (position === 2) return { variant: "secondary" as const, icon: "🥈" };
    if (position === 3) return { variant: "secondary" as const, icon: "🥉" };
    return { variant: "outline" as const, icon: `#${position}` };
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-center text-2xl bg-gradient-primary bg-clip-text text-transparent">
          🏆 Ranking Geral
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário com pontos ainda.
            </div>
          ) : (
            sortedUsers.map((user) => {
              const positionBadge = getPositionBadge(user.position!);
              const isCurrentUser = user.id === currentUserId;
              
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    isCurrentUser
                      ? "bg-gradient-card shadow-glow border-2 border-primary/20"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant={positionBadge.variant}
                      className="min-w-[3rem] justify-center font-bold"
                    >
                      {positionBadge.icon}
                    </Badge>
                    
                    <div>
                      <div className={`font-semibold ${isCurrentUser ? "text-primary" : ""}`}>
                        {user.nickname}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${isCurrentUser ? "text-primary" : ""}`}>
                      {user.pointsTotal}
                    </div>
                    <div className="text-xs text-muted-foreground">pontos</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {sortedUsers.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-card rounded-lg">
            <div className="text-center text-sm text-muted-foreground">
              <div className="font-medium mb-2">Sistema de Pontuação</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>🎯 Placar exato: <span className="font-bold text-success">10 pontos</span></div>
                <div>✅ Resultado correto: <span className="font-bold text-accent">5 pontos</span></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
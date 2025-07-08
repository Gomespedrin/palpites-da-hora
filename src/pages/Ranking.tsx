import { useRanking } from "@/hooks/useRanking";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal } from 'lucide-react';

const Ranking = () => {
  const { ranking, loading } = useRanking();
  const { profile } = useAuth();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
          🏆 Ranking dos Palpiteiros
        </h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
        🏆 Ranking dos Palpiteiros
      </h1>
      
      <div className="space-y-4">
        {ranking.map((user, index) => {
          const isCurrentUser = user.id === profile?.id;
          return (
            <Card
              key={user.id}
              className={`shadow-card hover:shadow-elegant transition-all duration-300 ${
                isCurrentUser ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">
                      {getPositionIcon(user.position)}
                    </div>
                    <Avatar>
                      <AvatarImage src={`/users/${user.id}.jpg`} />
                      <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                        {user.nickname}
                        {isCurrentUser && <span className="text-sm text-muted-foreground ml-2">(Você)</span>}
                      </h3>
                      {user.position <= 3 && (
                        <Badge className="text-xs">
                          {user.position === 1 ? 'Rei dos Palpites' : 
                           user.position === 2 ? 'Vice-campeão' : 'Top 3'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{user.points_total}</p>
                    <p className="text-sm text-muted-foreground">Pontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {ranking.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum usuário no ranking</h3>
              <p className="text-muted-foreground">
                Seja o primeiro a fazer palpites e aparecer no ranking!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Ranking;
import { useState, useEffect } from "react";
import { GameCard } from "@/components/Game/GameCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useGames } from "@/hooks/useGames";

const Dashboard = () => {
  const { profile } = useAuth();
  const { games, currentRound, submitBet } = useGames();

  const handleBetSubmit = (gameId: string, betA: number, betB: number) => {
    submitBet(gameId, betA, betB);
  };

  // Filter games based on current time and game status
  const now = new Date();
  const openGames = games.filter(game => {
    const gameTime = new Date(game.date_time);
    const cutoffTime = new Date(gameTime.getTime() - 30 * 60 * 1000); // 30 minutes before
    return !game.finished && now < cutoffTime;
  });
  
  const closedGames = games.filter(game => {
    const gameTime = new Date(game.date_time);
    const cutoffTime = new Date(gameTime.getTime() - 30 * 60 * 1000);
    return game.finished || now >= cutoffTime;
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">
            Olá, {profile?.nickname || 'Usuário'}! ⚽
          </CardTitle>
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-sm">
              {currentRound?.name || 'Nenhuma rodada ativa'}
            </Badge>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Seus pontos</div>
              <div className="text-2xl font-bold text-primary">{profile?.points_total || 0}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Open Games */}
      {openGames.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-primary">
            🔥 Jogos Abertos para Palpites
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onBetSubmit={handleBetSubmit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Closed Games */}
      {closedGames.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            🔒 Jogos Encerrados
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {closedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onBetSubmit={handleBetSubmit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {games.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum jogo disponível</h3>
            <p className="text-muted-foreground">
              Aguarde a próxima rodada ser liberada pelo administrador.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-primary">{games.filter(g => g.userBet).length}</div>
            <div className="text-sm text-muted-foreground">Palpites Feitos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-accent">{openGames.length}</div>
            <div className="text-sm text-muted-foreground">Jogos Disponíveis</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-bold text-success">{profile?.points_total || 0}</div>
            <div className="text-sm text-muted-foreground">Total de Pontos</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  teamA: string;
  teamB: string;
  dateTime: string;
  scoreA?: number;
  scoreB?: number;
  finished: boolean;
}

const Admin = () => {
  const [games, setGames] = useState<Game[]>([
    {
      id: "1",
      teamA: "Flamengo",
      teamB: "Palmeiras",
      dateTime: "2024-07-05T20:00:00",
      finished: false,
    },
    {
      id: "2",
      teamA: "São Paulo",
      teamB: "Corinthians",
      dateTime: "2024-07-06T16:00:00",
      finished: false,
    },
  ]);

  const [newGame, setNewGame] = useState({
    teamA: "",
    teamB: "",
    dateTime: "",
  });

  const [roundName, setRoundName] = useState("Rodada 1 - Brasileirão");
  const { toast } = useToast();

  const handleCreateGame = () => {
    if (!newGame.teamA || !newGame.teamB || !newGame.dateTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do jogo.",
        variant: "destructive",
      });
      return;
    }

    const game: Game = {
      id: Date.now().toString(),
      teamA: newGame.teamA,
      teamB: newGame.teamB,
      dateTime: newGame.dateTime,
      finished: false,
    };

    setGames([...games, game]);
    setNewGame({ teamA: "", teamB: "", dateTime: "" });
    
    toast({
      title: "Jogo criado!",
      description: `${game.teamA} x ${game.teamB} adicionado à rodada.`,
    });
  };

  const handleFinishGame = (gameId: string, scoreA: number, scoreB: number) => {
    setGames(prevGames =>
      prevGames.map(game =>
        game.id === gameId
          ? { ...game, scoreA, scoreB, finished: true }
          : game
      )
    );

    toast({
      title: "Resultado registrado!",
      description: "Pontos dos usuários foram recalculados.",
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateTime));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            🛠️ Painel Administrativo
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Round Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Rodada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="roundName">Nome da Rodada</Label>
            <Input
              id="roundName"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="Ex: Rodada 1 - Brasileirão"
            />
          </div>
          <Button variant="sport" onClick={() => {
            toast({
              title: "Rodada atualizada!",
              description: `Nome alterado para: ${roundName}`,
            });
          }}>
            Atualizar Rodada
          </Button>
        </CardContent>
      </Card>

      {/* Create New Game */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Jogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="teamA">Time A</Label>
              <Input
                id="teamA"
                value={newGame.teamA}
                onChange={(e) => setNewGame({ ...newGame, teamA: e.target.value })}
                placeholder="Ex: Flamengo"
              />
            </div>
            <div>
              <Label htmlFor="teamB">Time B</Label>
              <Input
                id="teamB"
                value={newGame.teamB}
                onChange={(e) => setNewGame({ ...newGame, teamB: e.target.value })}
                placeholder="Ex: Palmeiras"
              />
            </div>
            <div>
              <Label htmlFor="dateTime">Data e Hora</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={newGame.dateTime}
                onChange={(e) => setNewGame({ ...newGame, dateTime: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleCreateGame} variant="hero" className="w-full">
            Criar Jogo
          </Button>
        </CardContent>
      </Card>

      {/* Games List */}
      <Card>
        <CardHeader>
          <CardTitle>Jogos da Rodada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {games.map((game) => (
              <GameAdminCard
                key={game.id}
                game={game}
                onFinishGame={handleFinishGame}
              />
            ))}
            {games.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum jogo criado ainda.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;

interface GameAdminCardProps {
  game: Game;
  onFinishGame: (gameId: string, scoreA: number, scoreB: number) => void;
}

const GameAdminCard = ({ game, onFinishGame }: GameAdminCardProps) => {
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const handleSubmit = () => {
    const finalScoreA = parseInt(scoreA);
    const finalScoreB = parseInt(scoreB);
    
    if (isNaN(finalScoreA) || isNaN(finalScoreB)) {
      return;
    }

    onFinishGame(game.id, finalScoreA, finalScoreB);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          {game.teamA} x {game.teamB}
        </div>
        <Badge variant={game.finished ? "secondary" : "default"}>
          {game.finished ? "Finalizado" : "Pendente"}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground">
        📅 {new Date(game.dateTime).toLocaleString('pt-BR')}
      </div>

      {game.finished ? (
        <div className="bg-muted/50 rounded p-3 text-center">
          <div className="text-lg font-bold">
            Resultado: {game.scoreA} - {game.scoreB}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Gols do time A"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              min="0"
            />
          </div>
          <div>x</div>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Gols do time B"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              min="0"
            />
          </div>
          <Button 
            onClick={handleSubmit}
            variant="default"
            disabled={!scoreA || !scoreB}
          >
            Finalizar
          </Button>
        </div>
      )}
    </div>
  );
};
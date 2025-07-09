import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Verificar se está autenticado e se é admin
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  const [allGames, setAllGames] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [newGame, setNewGame] = useState({
    teamA: "",
    teamB: "",
    dateTime: "",
  });
  const [roundName, setRoundName] = useState("");
  
  const { toast } = useToast();
  const { createRound, createGame, finishGame, loading } = useAdmin();

  useEffect(() => {
    fetchRounds();
    fetchAllGames();
  }, []);

  const fetchRounds = async () => {
    const { data } = await supabase
      .from('rounds')
      .select('*')
      .order('created_at', { ascending: false });
    
    setRounds(data || []);
    const activeRound = data?.find(round => round.status === 'aberta');
    setCurrentRound(activeRound || data?.[0]);
  };

  const fetchAllGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('date_time');
    
    setAllGames(data || []);
  };

  const handleCreateRound = async () => {
    if (!roundName) {
      toast({
        title: "Campo obrigatório",
        description: "Digite o nome da rodada.",
        variant: "destructive",
      });
      return;
    }

    const { data } = await createRound(roundName);
    if (data) {
      setRoundName("");
      fetchRounds();
    }
  };

  const handleCreateGame = async () => {
    if (!newGame.teamA || !newGame.teamB || !newGame.dateTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do jogo.",
        variant: "destructive",
      });
      return;
    }

    if (!currentRound) {
      toast({
        title: "Erro",
        description: "Crie uma rodada primeiro.",
        variant: "destructive",
      });
      return;
    }

    const { data } = await createGame(
      currentRound.id,
      newGame.teamA,
      newGame.teamB,
      newGame.dateTime
    );
    
    if (data) {
      setNewGame({ teamA: "", teamB: "", dateTime: "" });
      fetchAllGames();
    }
  };

  const handleFinishGame = async (gameId: string, scoreA: number, scoreB: number) => {
    const { data } = await finishGame(gameId, scoreA, scoreB);
    if (data) {
      fetchAllGames();
    }
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
            <Label htmlFor="roundName">Nome da Nova Rodada</Label>
            <Input
              id="roundName"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="Ex: Rodada 2 - Brasileirão"
            />
          </div>
          {currentRound && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Rodada Ativa</div>
              <div className="text-lg">{currentRound.name}</div>
            </div>
          )}
          <Button variant="sport" onClick={handleCreateRound} disabled={loading}>
            {loading ? "Criando..." : "Criar Nova Rodada"}
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
          <Button onClick={handleCreateGame} variant="hero" className="w-full" disabled={loading || !currentRound}>
            {loading ? "Criando..." : "Criar Jogo"}
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
            {allGames.map((game) => (
              <GameAdminCard
                key={game.id}
                game={game}
                onFinishGame={handleFinishGame}
              />
            ))}
            {allGames.length === 0 && (
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
  game: any;
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
          {game.team_a} x {game.team_b}
        </div>
        <Badge variant={game.finished ? "secondary" : "default"}>
          {game.finished ? "Finalizado" : "Pendente"}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground">
        📅 {new Date(game.date_time).toLocaleString('pt-BR')}
      </div>

      {game.finished ? (
        <div className="bg-muted/50 rounded p-3 text-center">
          <div className="text-lg font-bold">
            Resultado: {game.score_a} - {game.score_b}
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
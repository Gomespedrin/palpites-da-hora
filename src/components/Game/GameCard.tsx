import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GameCardProps {
  game: {
    id: string;
    team_a: string;
    team_b: string;
    date_time: string;
    finished?: boolean;
    score_a?: number;
    score_b?: number;
    bets?: Array<{
      bet_a: number;
      bet_b: number;
      points_awarded?: number;
      locked: boolean;
    }>;
  };
  onBetSubmit: (gameId: string, betA: number, betB: number) => void;
}

export const GameCard = ({ game, onBetSubmit }: GameCardProps) => {
  const userBet = game.bets?.[0]; // Assuming first bet is current user's bet
  const [betA, setBetA] = useState(userBet?.bet_a?.toString() || "");
  const [betB, setBetB] = useState(userBet?.bet_b?.toString() || "");
  const { toast } = useToast();

  const gameDate = new Date(game.date_time);
  const now = new Date();
  const cutoffTime = new Date(gameDate.getTime() - 30 * 60 * 1000); // 30 min antes
  const isLocked = game.finished || now >= cutoffTime || userBet?.locked;
  const hasResult = game.finished && (game.score_a !== undefined && game.score_b !== undefined);

  const handleSubmit = () => {
    const scoreA = parseInt(betA);
    const scoreB = parseInt(betB);
    
    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      toast({
        title: "Palpite inválido",
        description: "Digite números válidos para os placares.",
        variant: "destructive",
      });
      return;
    }

    onBetSubmit(game.id, scoreA, scoreB);
  };

  const formatDateTime = (dateTime: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateTime));
  };

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Badge variant={isLocked ? "destructive" : "default"} className="text-xs">
            {isLocked ? "Fechado" : "Aberto"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(game.date_time)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Times */}
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <div className="font-semibold text-lg">{game.team_a}</div>
          </div>
          <div className="mx-4 text-2xl font-bold text-muted-foreground">VS</div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{game.team_b}</div>
          </div>
        </div>

        {/* Resultado final (se disponível) */}
        {hasResult && (
          <div className="bg-gradient-card rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground mb-1">Resultado Final</div>
            <div className="text-2xl font-bold text-primary">
              {game.score_a} - {game.score_b}
            </div>
            {userBet && userBet.points_awarded !== undefined && (
              <div className="text-sm mt-2">
                <Badge variant={userBet.points_awarded > 0 ? "default" : "secondary"}>
                  {userBet.points_awarded > 0 ? `+${userBet.points_awarded} pts` : '0 pts'}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Palpites */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-center">Seu Palpite</div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 text-center">
              <Input
                type="number"
                value={betA}
                onChange={(e) => setBetA(e.target.value)}
                placeholder="0"
                className="text-center text-lg font-semibold"
                disabled={isLocked}
                min="0"
              />
            </div>
            <div className="text-xl font-bold">x</div>
            <div className="flex-1 text-center">
              <Input
                type="number"
                value={betB}
                onChange={(e) => setBetB(e.target.value)}
                placeholder="0"
                className="text-center text-lg font-semibold"
                disabled={isLocked}
                min="0"
              />
            </div>
          </div>

          {!isLocked && (
            <Button 
              onClick={handleSubmit}
              className="w-full"
              variant="sport"
              disabled={!betA || !betB}
            >
              Salvar Palpite
            </Button>
          )}

          {userBet && (
            <div className="text-center text-sm text-muted-foreground">
              Palpite atual: {userBet.bet_a} x {userBet.bet_b}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
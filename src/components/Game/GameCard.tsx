import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GameCardProps {
  game: {
    id: string;
    teamA: string;
    teamB: string;
    dateTime: string;
    locked?: boolean;
    userBet?: {
      betA: number;
      betB: number;
    };
    result?: {
      scoreA: number;
      scoreB: number;
    };
  };
  onBetSubmit: (gameId: string, betA: number, betB: number) => void;
}

export const GameCard = ({ game, onBetSubmit }: GameCardProps) => {
  const [betA, setBetA] = useState(game.userBet?.betA?.toString() || "");
  const [betB, setBetB] = useState(game.userBet?.betB?.toString() || "");
  const { toast } = useToast();

  const gameDate = new Date(game.dateTime);
  const now = new Date();
  const isLocked = game.locked || gameDate.getTime() - now.getTime() < 30 * 60 * 1000; // 30 min antes
  const hasResult = !!game.result;

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
    toast({
      title: "Palpite salvo!",
      description: `${game.teamA} ${scoreA} x ${scoreB} ${game.teamB}`,
    });
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
            {formatDateTime(game.dateTime)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Times */}
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <div className="font-semibold text-lg">{game.teamA}</div>
          </div>
          <div className="mx-4 text-2xl font-bold text-muted-foreground">VS</div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{game.teamB}</div>
          </div>
        </div>

        {/* Resultado final (se disponível) */}
        {hasResult && (
          <div className="bg-gradient-card rounded-lg p-3 text-center">
            <div className="text-sm text-muted-foreground mb-1">Resultado Final</div>
            <div className="text-2xl font-bold text-primary">
              {game.result!.scoreA} - {game.result!.scoreB}
            </div>
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

          {game.userBet && (
            <div className="text-center text-sm text-muted-foreground">
              Palpite atual: {game.userBet.betA} x {game.userBet.betB}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
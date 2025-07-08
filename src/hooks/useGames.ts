import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useGames = () => {
  const [games, setGames] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRounds();
    fetchGames();
  }, []);

  const fetchRounds = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRounds(data || []);
      const activeRound = data?.find(round => round.status === 'aberta');
      setCurrentRound(activeRound || data?.[0]);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      
      // Fetch games with user bets
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          bets (
            bet_a,
            bet_b,
            points_awarded,
            locked
          )
        `)
        .order('date_time');

      if (gamesError) throw gamesError;

      setGames(gamesData || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar jogos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitBet = async (gameId: string, betA: number, betB: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Check if game is still open for betting
      const game = games.find(g => g.id === gameId);
      const gameTime = new Date(game?.date_time);
      const cutoffTime = new Date(gameTime.getTime() - 30 * 60 * 1000); // 30 minutes before
      
      if (new Date() > cutoffTime) {
        toast({
          title: 'Tempo esgotado',
          description: 'Não é mais possível enviar palpites para este jogo',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('bets')
        .upsert({
          user_id: user.id,
          game_id: gameId,
          bet_a: betA,
          bet_b: betB,
          locked: false,
        });

      if (error) throw error;

      toast({
        title: 'Palpite enviado!',
        description: `${betA} x ${betB}`,
      });

      // Refresh games to show updated bet
      fetchGames();
    } catch (error: any) {
      console.error('Error submitting bet:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    games,
    rounds,
    currentRound,
    loading,
    submitBet,
    fetchGames,
    fetchRounds,
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Game {
  id: string;
  round_id: string;
  team_a: string;
  team_b: string;
  date_time: string;
  score_a: number | null;
  score_b: number | null;
  finished: boolean;
  created_at: string;
  updated_at: string;
  bets?: Bet[];
  can_edit?: boolean;
}

export interface Bet {
  id: string;
  game_id: string;
  user_id: string;
  bet_a: number;
  bet_b: number;
  points_awarded: number | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Round {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRounds = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('status', 'aberta')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setCurrentRound(data?.[0] || null);
    } catch (error: any) {
      console.error('Error fetching rounds:', error);
    }
  };

  const fetchGames = async () => {
    if (!currentRound) return;

    try {
      setLoading(true);
      
      // Fetch all games for current round
      const { data: allGames, error: allGamesError } = await supabase
        .from('games')
        .select('*')
        .eq('round_id', currentRound.id)
        .order('date_time', { ascending: true });

      if (allGamesError) throw allGamesError;

      // Fetch user bets for these games
      let userBets: any[] = [];
      if (user) {
        const gameIds = allGames?.map(g => g.id) || [];
        const { data: betsData, error: betsError } = await supabase
          .from('bets')
          .select('*')
          .in('game_id', gameIds)
          .eq('user_id', user.id);

        if (betsError) throw betsError;
        userBets = betsData || [];
      }

      // Merge games with bets and check if can edit
      const gamesWithBets = allGames?.map(game => {
        const gameBets = userBets.filter(bet => bet.game_id === game.id);
        
        return {
          ...game,
          bets: gameBets,
          can_edit: new Date(game.date_time).getTime() - 30 * 60 * 1000 > Date.now()
        };
      }) || [];

      setGames(gamesWithBets);
    } catch (error: any) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os jogos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitBet = async (gameId: string, betA: number, betB: number) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para fazer palpites',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if bet already exists
      const { data: existingBets } = await supabase
        .from('bets')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', user.id);

      if (existingBets && existingBets.length > 0) {
        // Update existing bet
        const { error } = await supabase
          .from('bets')
          .update({
            bet_a: betA,
            bet_b: betB,
          })
          .eq('id', existingBets[0].id);

        if (error) throw error;
      } else {
        // Create new bet
        const { error } = await supabase
          .from('bets')
          .insert({
            game_id: gameId,
            user_id: user.id,
            bet_a: betA,
            bet_b: betB,
          });

        if (error) throw error;
      }

      toast({
        title: 'Palpite salvo!',
        description: `Seu palpite ${betA} x ${betB} foi registrado.`,
      });

      // Refresh games
      await fetchGames();
    } catch (error: any) {
      console.error('Error submitting bet:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o palpite',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchRounds();
    }
  }, [user]);

  useEffect(() => {
    if (currentRound) {
      fetchGames();
    }
  }, [currentRound, user]);

  return {
    games,
    currentRound,
    loading,
    submitBet,
    refresh: fetchGames,
  };
};
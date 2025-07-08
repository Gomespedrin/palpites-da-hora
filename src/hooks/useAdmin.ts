import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createRound = async (name: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('rounds')
        .insert({ name, status: 'aberta' })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Rodada criada!',
        description: `Rodada "${name}" foi criada com sucesso.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (roundId: string, teamA: string, teamB: string, dateTime: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('games')
        .insert({
          round_id: roundId,
          team_a: teamA,
          team_b: teamB,
          date_time: dateTime,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Jogo criado!',
        description: `${teamA} x ${teamB} adicionado à rodada.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const finishGame = async (gameId: string, scoreA: number, scoreB: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('games')
        .update({
          score_a: scoreA,
          score_b: scoreB,
          finished: true,
        })
        .eq('id', gameId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Resultado registrado!',
        description: 'Pontos dos usuários foram recalculados.',
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const lockBetsBeforeGames = async () => {
    try {
      // This would be called by a scheduled function
      const { error } = await supabase.rpc('lock_bets_before_game');
      if (error) throw error;
    } catch (error) {
      console.error('Error locking bets:', error);
    }
  };

  return {
    loading,
    createRound,
    createGame,
    finishGame,
    lockBetsBeforeGames,
  };
};
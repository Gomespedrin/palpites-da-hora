import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface RankingUser {
  id: string;
  nickname: string;
  points_total: number;
  position?: number;
}

export const useRanking = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, points_total')
        .order('points_total', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Add position to each user
      const rankingWithPosition = data?.map((user, index) => ({
        ...user,
        position: index + 1,
      })) || [];

      setRanking(rankingWithPosition);
    } catch (error: any) {
      console.error('Error fetching ranking:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o ranking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    ranking,
    loading,
    refresh: fetchRanking,
  };
};
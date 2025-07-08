import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useRanking = () => {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, points_total')
        .order('points_total', { ascending: false });

      if (error) throw error;

      // Add position to each user
      const rankingWithPosition = data?.map((user, index) => ({
        ...user,
        position: index + 1,
      })) || [];

      setRanking(rankingWithPosition);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ranking,
    loading,
    fetchRanking,
  };
};
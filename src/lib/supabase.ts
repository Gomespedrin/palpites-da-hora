// Import the supabase client from the integrations folder
export { supabase } from '@/integrations/supabase/client';

// Database types
export interface User {
  id: string;
  email: string;
  nickname: string;
  points_total: number;
  created_at: string;
  updated_at: string;
}

export interface Round {
  id: string;
  name: string;
  status: 'aberta' | 'fechada';
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  round_id: string;
  team_a: string;
  team_b: string;
  date_time: string;
  score_a?: number;
  score_b?: number;
  finished: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  game_id: string;
  bet_a: number;
  bet_b: number;
  points_awarded?: number;
  created_at: string;
  updated_at: string;
  locked: boolean;
}
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom users table (extending auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  points_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create rounds table
CREATE TABLE public.rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('aberta', 'fechada')) DEFAULT 'aberta',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  score_a INTEGER,
  score_b INTEGER,
  finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  bet_a INTEGER NOT NULL,
  bet_b INTEGER NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nickname');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON public.rounds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bets_updated_at BEFORE UPDATE ON public.bets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to lock bets 30 minutes before game
CREATE OR REPLACE FUNCTION lock_bets_before_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Lock bets for games starting in 30 minutes or less
  UPDATE public.bets 
  SET locked = TRUE 
  WHERE game_id IN (
    SELECT id FROM public.games 
    WHERE date_time <= NOW() + INTERVAL '30 minutes' 
    AND finished = FALSE
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate points when game finishes
CREATE OR REPLACE FUNCTION calculate_points_for_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if game just finished
  IF NEW.finished = TRUE AND OLD.finished = FALSE THEN
    -- Update points for each bet on this game
    UPDATE public.bets SET points_awarded = (
      CASE 
        -- Exact score: 10 points
        WHEN bet_a = NEW.score_a AND bet_b = NEW.score_b THEN 10
        -- Correct result (win/draw/loss): 5 points
        WHEN (
          (bet_a > bet_b AND NEW.score_a > NEW.score_b) OR  -- Team A wins
          (bet_a < bet_b AND NEW.score_a < NEW.score_b) OR  -- Team B wins
          (bet_a = bet_b AND NEW.score_a = NEW.score_b)     -- Draw
        ) THEN 5
        -- Wrong result: 0 points
        ELSE 0
      END
    )
    WHERE game_id = NEW.id;

    -- Update user total points
    UPDATE public.users SET points_total = (
      SELECT COALESCE(SUM(points_awarded), 0) 
      FROM public.bets 
      WHERE user_id = public.users.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate points when game finishes
CREATE TRIGGER calculate_points_on_game_finish
  AFTER UPDATE ON public.games
  FOR EACH ROW EXECUTE PROCEDURE calculate_points_for_game();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Everyone can view rounds and games
CREATE POLICY "Anyone can view rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);

-- Users can only see and manage their own bets
CREATE POLICY "Users can view own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unlocked bets" ON public.bets FOR UPDATE USING (auth.uid() = user_id AND locked = FALSE);

-- Admin policies (you'll need to set user role in auth.users metadata)
CREATE POLICY "Admins can manage rounds" ON public.rounds FOR ALL USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);
CREATE POLICY "Admins can manage games" ON public.games FOR ALL USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);
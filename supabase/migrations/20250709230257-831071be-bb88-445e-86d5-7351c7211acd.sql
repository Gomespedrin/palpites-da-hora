-- Corrigir search_path das funções existentes para segurança
CREATE OR REPLACE FUNCTION public.calculate_bet_points(bet_a integer, bet_b integer, score_a integer, score_b integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Exact score match: 10 points
  IF bet_a = score_a AND bet_b = score_b THEN
    RETURN 10;
  END IF;
  
  -- Correct result (win/draw/loss): 5 points
  IF (bet_a > bet_b AND score_a > score_b) OR 
     (bet_a < bet_b AND score_a < score_b) OR 
     (bet_a = bet_b AND score_a = score_b) THEN
    RETURN 5;
  END IF;
  
  -- Wrong prediction: 0 points
  RETURN 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_bet_points_and_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if game is being marked as finished
  IF NEW.finished = true AND OLD.finished = false THEN
    -- Update points for all bets on this game
    UPDATE public.bets 
    SET points_awarded = public.calculate_bet_points(bet_a, bet_b, NEW.score_a, NEW.score_b)
    WHERE game_id = NEW.id;
    
    -- Update user total points
    UPDATE public.users 
    SET points_total = (
      SELECT COALESCE(SUM(points_awarded), 0)
      FROM public.bets 
      WHERE user_id = users.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Corrigir RLS policies para melhor performance
-- Dropar policies antigas primeiro
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Only admins can manage rounds" ON public.rounds;
DROP POLICY IF EXISTS "Only admins can manage games" ON public.games;
DROP POLICY IF EXISTS "Users can create their own bets" ON public.bets;
DROP POLICY IF EXISTS "Users can update their own bets" ON public.bets;
DROP POLICY IF EXISTS "Users can delete their own bets" ON public.bets;
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;

-- Criar função para verificar admin (evita múltiplas policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- Policies otimizadas
CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Only admins can manage rounds" ON public.rounds
FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can manage games" ON public.games
FOR ALL USING (public.is_admin());

CREATE POLICY "Users can create their own bets" ON public.bets
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own bets" ON public.bets
FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own bets" ON public.bets
FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Adicionar constraint para nickname único se não existir
DO $$
BEGIN
    ALTER TABLE public.users ADD CONSTRAINT users_nickname_unique UNIQUE (nickname);
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Constraint já existe
END
$$;

-- Função para verificar se aposta pode ser editada (não passou de 30 min antes do jogo)
CREATE OR REPLACE FUNCTION public.can_edit_bet(game_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    SELECT date_time - interval '30 minutes' > now()
    FROM public.games 
    WHERE id = game_id_param
  );
$$;
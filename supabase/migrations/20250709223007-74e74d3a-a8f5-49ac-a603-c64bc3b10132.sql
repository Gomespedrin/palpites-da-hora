-- Create push_subscriptions table for Web Push notifications
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the points calculation function to use the correct scoring
CREATE OR REPLACE FUNCTION public.calculate_bet_points(bet_a integer, bet_b integer, score_a integer, score_b integer)
RETURNS integer
LANGUAGE plpgsql
AS $function$
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
$function$;
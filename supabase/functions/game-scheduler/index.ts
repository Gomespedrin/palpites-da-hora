import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000)

    // Find games starting in 1 hour (for reminders)
    const { data: upcomingGames } = await supabaseClient
      .from('games')
      .select('id, team_a, team_b, date_time, round_id')
      .gte('date_time', oneHourFromNow.toISOString())
      .lt('date_time', new Date(oneHourFromNow.getTime() + 10 * 60 * 1000).toISOString()) // 10 min window
      .eq('finished', false)

    // Lock bets for games starting in 30 minutes
    const { data: gamesNearStart } = await supabaseClient
      .from('games')
      .select('id')
      .gte('date_time', thirtyMinFromNow.toISOString())
      .lt('date_time', new Date(thirtyMinFromNow.getTime() + 10 * 60 * 1000).toISOString())
      .eq('finished', false)

    // Lock bets for games starting soon
    if (gamesNearStart?.length) {
      await supabaseClient
        .from('bets')
        .update({ locked: true })
        .in('game_id', gamesNearStart.map(g => g.id))
        .eq('locked', false)
    }

    // Send reminders for upcoming games
    if (upcomingGames?.length) {
      for (const game of upcomingGames) {
        await supabaseClient.functions.invoke('send-push-notifications', {
          body: {
            type: 'game_reminder',
            gameId: game.id
          }
        })
      }
    }

    // Check for recently finished games (results just added)
    const { data: recentResults } = await supabaseClient
      .from('games')
      .select('id, round_id, updated_at')
      .eq('finished', true)
      .gte('updated_at', new Date(now.getTime() - 10 * 60 * 1000).toISOString()) // Last 10 minutes

    // Send results notifications
    const notifiedRounds = new Set()
    if (recentResults?.length) {
      for (const game of recentResults) {
        if (!notifiedRounds.has(game.round_id)) {
          await supabaseClient.functions.invoke('send-push-notifications', {
            body: {
              type: 'results_available',
              roundId: game.round_id
            }
          })
          notifiedRounds.add(game.round_id)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Scheduler executed successfully',
        upcomingGames: upcomingGames?.length || 0,
        lockedGames: gamesNearStart?.length || 0,
        resultsNotifications: notifiedRounds.size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Scheduler error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
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

    const { type, gameId, roundId } = await req.json()

    let notifications: NotificationPayload[] = []
    let targetUserIds: string[] = []

    if (type === 'game_reminder') {
      // Get users who haven't bet on this game yet
      const { data: game } = await supabaseClient
        .from('games')
        .select('team_a, team_b, date_time')
        .eq('id', gameId)
        .single()

      if (!game) throw new Error('Game not found')

      // Get all users
      const { data: allUsers } = await supabaseClient
        .from('users')
        .select('id')

      // Get users who already bet on this game
      const { data: existingBets } = await supabaseClient
        .from('bets')
        .select('user_id')
        .eq('game_id', gameId)

      const usersWithBets = new Set(existingBets?.map(bet => bet.user_id) || [])
      targetUserIds = (allUsers || [])
        .filter(user => !usersWithBets.has(user.id))
        .map(user => user.id)

      notifications.push({
        title: '⏰ Tempo esgotando!',
        body: `Você ainda não fez seu palpite para ${game.team_a} x ${game.team_b}. Restam 30 minutos!`,
        icon: '/icon-192x192.png',
        data: { gameId }
      })
    } else if (type === 'results_available') {
      // Get all users who bet on games in this round
      const { data: bettingUsers } = await supabaseClient
        .from('bets')
        .select('user_id')
        .in('game_id', 
          await supabaseClient
            .from('games')
            .select('id')
            .eq('round_id', roundId)
            .then(res => res.data?.map(g => g.id) || [])
        )

      targetUserIds = [...new Set(bettingUsers?.map(bet => bet.user_id) || [])]

      notifications.push({
        title: '🎯 Resultados atualizados!',
        body: 'Novos placares foram registrados. Confira sua pontuação!',
        icon: '/icon-192x192.png',
        data: { roundId }
      })
    }

    // Get push subscriptions for target users
    const { data: subscriptions } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds)

    if (!subscriptions?.length) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const notification = notifications[0]
        
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            notification: {
              title: notification.title,
              body: notification.body,
              icon: notification.icon,
            },
            data: notification.data,
          }),
        })

        if (!response.ok) {
          console.error('Failed to send notification:', await response.text())
          throw new Error('Failed to send notification')
        }

        return response.json()
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`Sent ${successful} notifications, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successful} notifications, ${failed} failed`,
        successful,
        failed 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending push notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
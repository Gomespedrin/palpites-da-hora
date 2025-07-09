import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Push API is supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    
    // Check current subscription status
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push',
        variant: 'destructive',
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast({
        title: 'Permissão concedida!',
        description: 'Você receberá notificações sobre os jogos',
      });
      return true;
    } else {
      toast({
        title: 'Permissão negada',
        description: 'Você não receberá notificações push',
        variant: 'destructive',
      });
      return false;
    }
  };

  const subscribe = async () => {
    if (!isSupported) return;

    setLoading(true);
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID key (in production, this should come from your server)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI4DRFP_vDMyoZFzKdRlNAUJaMKPOuqCJr_cOSq0cQzYT_1fU4Cf38iVgc';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Save subscription to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const subscriptionData = subscription.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint!,
          p256dh: subscriptionData.keys!.p256dh!,
          auth: subscriptionData.keys!.auth!,
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Inscrito com sucesso!',
        description: 'Você receberá notificações sobre os jogos',
      });

    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Erro na inscrição',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }

      setIsSubscribed(false);
      toast({
        title: 'Desinscrição realizada',
        description: 'Você não receberá mais notificações',
      });

    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: 'Erro na desinscrição',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};
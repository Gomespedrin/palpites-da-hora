import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('useAuth: useEffect iniciado');
    
    // Get initial session
    const getSession = async () => {
      console.log('useAuth: Buscando sessão inicial...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('useAuth: Sessão inicial encontrada:', session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('useAuth: Buscando perfil do usuário...');
        await fetchProfile(session.user.id);
      }
      console.log('useAuth: setLoading(false) - inicial');
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('useAuth: Buscando perfil após auth change...');
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        console.log('useAuth: setLoading(false) - auth change');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, nickname: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nickname,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Conta criada!',
        description: `Verifique seu email para confirmar a conta. Bem-vindo, ${nickname}!`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Tentando fazer login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('useAuth: Login bem-sucedido:', data);
      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta!',
      });

      return { data, error: null };
    } catch (error: any) {
      console.log('useAuth: Erro no login:', error);
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no logout',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
  };
};
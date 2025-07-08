import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/Auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const { data } = await signIn(email, password);
    if (data?.user) {
      navigate('/dashboard');
    }
  };

  const handleRegister = async (email: string, password: string, nickname: string, phone?: string) => {
    const { data } = await signUp(email, password, nickname);
    if (data?.user) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: Implementar Google OAuth
    console.log('Google login - to be implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};

export default Auth;
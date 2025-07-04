import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/Auth/AuthForm';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    // Mock login - substituir por API real
    console.log('Login:', { email, password });
    
    // Simular requisição
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('auth_token', 'mock-token');
    
    toast({
      title: 'Login realizado!',
      description: `Bem-vindo de volta!`,
    });
    
    navigate('/dashboard');
  };

  const handleRegister = async (email: string, password: string, nickname: string, phone?: string) => {
    // Mock register - substituir por API real
    console.log('Register:', { email, password, nickname, phone });
    
    // Simular requisição
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('auth_token', 'mock-token');
    
    toast({
      title: 'Conta criada!',
      description: `Bem-vindo ao Palpites da Hora, ${nickname}!`,
    });
    
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    // Mock Google login - substituir por OAuth real
    console.log('Google login');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('auth_token', 'mock-google-token');
    
    toast({
      title: 'Login realizado!',
      description: 'Bem-vindo de volta!',
    });
    
    navigate('/dashboard');
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
import { useState } from "react";
import { LoginForm } from "@/components/Auth/LoginForm";
import { RegisterForm } from "@/components/Auth/RegisterForm";

interface AuthProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, nickname: string) => void;
}

export const Auth = ({ onLogin, onRegister }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl transform rotate-6"></div>
        <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl transform -rotate-6"></div>
        
        {/* Main content */}
        <div className="relative z-10">
          {isLogin ? (
            <LoginForm
              onLogin={onLogin}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onRegister={onRegister}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="fixed top-10 left-10 text-6xl animate-float opacity-20">⚽</div>
      <div className="fixed bottom-10 right-10 text-4xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🏆</div>
      <div className="fixed top-1/2 right-10 text-5xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🥅</div>
    </div>
  );
};
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import heroImage from '@/assets/hero-soccer.jpg';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('Index: isAuthenticated =', isAuthenticated, 'loading =', loading);

  // Se o usuário já está autenticado, redireciona para o dashboard
  if (isAuthenticated) {
    console.log('Index: Redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Palpites da Hora
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Sua plataforma de fantasy football definitiva. Faça seus palpites, 
                compete com amigos e prove que você é o verdadeiro expert em futebol!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/auth">Começar Agora</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/ranking">Ver Rankings</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src={heroImage} 
                alt="Fantasy Football" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Por que escolher o Palpites da Hora?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A experiência de fantasy football mais completa e divertida do Brasil
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                title: 'Competições',
                description: 'Participe de ligas emocionantes e ganhe prêmios incríveis'
              },
              {
                icon: Users,
                title: 'Comunidade',
                description: 'Conecte-se com outros fãs e forme seu grupo de amigos'
              },
              {
                icon: Target,
                title: 'Precisão',
                description: 'Sistema de pontuação justo e estatísticas detalhadas'
              },
              {
                icon: TrendingUp,
                title: 'Rankings',
                description: 'Acompanhe sua evolução e compare com outros jogadores'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de jogadores e mostre seus conhecimentos de futebol!
            </p>
            <Button asChild size="lg" className="text-lg px-12">
              <Link to="/auth">Criar Conta Grátis</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Crown, Users, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockUser = {
  nickname: 'CraqueDoFlamengo',
  pointsTotal: 85,
  isPresident: true,
};

const mockPlayers = [
  { id: '1', name: 'Gabriel Barbosa', position: 'ATA', points: 25, status: 'titular' },
  { id: '2', name: 'Bruno Henrique', position: 'ATA', points: 22, status: 'titular' },
  { id: '3', name: 'Arrascaeta', position: 'MEI', points: 28, status: 'titular' },
  { id: '4', name: 'Gerson', position: 'MEI', points: 24, status: 'titular' },
  { id: '5', name: 'Everton Ribeiro', position: 'MEI', points: 20, status: 'titular' },
  { id: '6', name: 'Filipe Luís', position: 'LAT', points: 18, status: 'reserva' },
  { id: '7', name: 'David Luiz', position: 'ZAG', points: 19, status: 'reserva' },
  { id: '8', name: 'Léo Pereira', position: 'ZAG', points: 16, status: 'reserva' },
  { id: '9', name: 'Ayrton Lucas', position: 'LAT', points: 17, status: 'reserva' },
  { id: '10', name: 'Hugo Souza', position: 'GOL', points: 15, status: 'reserva' },
];

const MeuTime = () => {
  const [players, setPlayers] = useState(mockPlayers);
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/auth');
  };

  const titulares = players.filter(p => p.status === 'titular');
  const reservas = players.filter(p => p.status === 'reserva');
  const totalPoints = players.reduce((sum, player) => sum + player.points, 0);

  const handleDragStart = (playerId: string) => {
    setDraggedPlayer(playerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: 'titular' | 'reserva') => {
    if (!draggedPlayer) return;

    setPlayers(prev => 
      prev.map(player => {
        if (player.id === draggedPlayer) {
          return { ...player, status: targetStatus };
        }
        return player;
      })
    );
    setDraggedPlayer(null);
  };

  const PlayerCard = ({ player }: { player: typeof mockPlayers[0] }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={() => handleDragStart(player.id)}
      className="cursor-move"
    >
      <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`/players/${player.id}.jpg`} />
              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{player.name}</h3>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">{player.position}</Badge>
                <span className="text-sm font-medium text-primary">{player.points} pts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={mockUser} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">Meu Time</h1>
              {mockUser.isPresident && (
                <Badge variant="secondary" className="bg-warning text-warning-foreground">
                  <Crown className="h-4 w-4 mr-1" />
                  Presidente
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{totalPoints} pts</p>
              <p className="text-sm text-muted-foreground">Total do time</p>
            </div>
          </div>
        </motion.div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Estatísticas do Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Titulares</p>
                  <p className="text-2xl font-bold">{titulares.length}/5</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reservas</p>
                  <p className="text-2xl font-bold">{reservas.length}/5</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Média de Pontos</p>
                  <p className="text-2xl font-bold">{(totalPoints / players.length).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência</p>
                  <Progress value={75} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Titulares */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="shadow-card min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('titular')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Titulares ({titulares.length}/5)</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {titulares.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                  {titulares.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Arraste jogadores para cá</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reservas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="shadow-card min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('reserva')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reservas ({reservas.length}/5)</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reservas.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                  {reservas.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Arraste jogadores para cá</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button size="lg" className="bg-gradient-primary">
            Salvar Escalação
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MeuTime;
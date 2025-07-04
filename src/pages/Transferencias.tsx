import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckIcon, XIcon, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockUser = {
  nickname: 'CraqueDoFlamengo',
  pointsTotal: 85,
};

const mockPendingTransfers = [
  {
    id: '1',
    fromUser: 'PalmeirasNaoTemMundial',
    toUser: 'CraqueDoFlamengo',
    player: 'Gabriel Barbosa',
    position: 'ATA',
    points: 25,
    timestamp: '2024-07-14T10:30:00',
    status: 'pending',
  },
  {
    id: '2',
    fromUser: 'TricolorSP',
    toUser: 'CraqueDoFlamengo',
    player: 'Arrascaeta',
    position: 'MEI',
    points: 28,
    timestamp: '2024-07-14T15:45:00',
    status: 'pending',
  },
];

const mockRecentTransfers = [
  {
    id: '3',
    fromUser: 'VascoDaGama',
    toUser: 'PalmeirasNaoTemMundial',
    player: 'Bruno Henrique',
    position: 'ATA',
    points: 22,
    timestamp: '2024-07-13T18:20:00',
    status: 'approved',
  },
  {
    id: '4',
    fromUser: 'FogoLoko',
    toUser: 'TricolorSP',
    player: 'Everton Ribeiro',
    position: 'MEI',
    points: 20,
    timestamp: '2024-07-13T14:15:00',
    status: 'rejected',
  },
  {
    id: '5',
    fromUser: 'TimaoFiel',
    toUser: 'GaloForte',
    player: 'David Luiz',
    position: 'ZAG',
    points: 19,
    timestamp: '2024-07-12T20:30:00',
    status: 'approved',
  },
];

const Transferencias = () => {
  const [pendingTransfers, setPendingTransfers] = useState(mockPendingTransfers);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleApproveTransfer = (transferId: string) => {
    setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
    toast({
      title: 'Transferência aprovada!',
      description: 'A transferência foi aprovada com sucesso.',
    });
  };

  const handleRejectTransfer = (transferId: string) => {
    setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
    toast({
      title: 'Transferência rejeitada',
      description: 'A transferência foi rejeitada.',
      variant: 'destructive',
    });
  };

  const TransferCard = ({ 
    transfer, 
    showActions = false 
  }: { 
    transfer: typeof mockPendingTransfers[0], 
    showActions?: boolean 
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`/players/${transfer.player}.jpg`} />
                <AvatarFallback>{transfer.player.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{transfer.player}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{transfer.position}</Badge>
                  <span className="text-sm text-primary font-medium">{transfer.points} pts</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{transfer.fromUser}</span>
                <TrendingUp className="h-4 w-4" />
                <span>{transfer.toUser}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(transfer.timestamp).toLocaleString('pt-BR')}
              </p>
              
              {transfer.status === 'pending' && (
                <Badge variant="secondary" className="mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendente
                </Badge>
              )}
              
              {transfer.status === 'approved' && (
                <Badge variant="default" className="mt-2 bg-success text-success-foreground">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Aprovada
                </Badge>
              )}
              
              {transfer.status === 'rejected' && (
                <Badge variant="destructive" className="mt-2">
                  <XIcon className="h-3 w-3 mr-1" />
                  Rejeitada
                </Badge>
              )}
            </div>
          </div>
          
          {showActions && transfer.status === 'pending' && (
            <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRejectTransfer(transfer.id)}
              >
                <XIcon className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
              <Button
                size="sm"
                onClick={() => handleApproveTransfer(transfer.id)}
                className="bg-success hover:bg-success/90"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Aprovar
              </Button>
            </div>
          )}
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
          <h1 className="text-3xl font-bold">Transferências</h1>
          <p className="text-muted-foreground">Gerencie as transferências de jogadores</p>
        </motion.div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pendentes ({pendingTransfers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Recentes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {pendingTransfers.length > 0 ? (
                <div className="space-y-4">
                  {pendingTransfers.map((transfer) => (
                    <TransferCard
                      key={transfer.id}
                      transfer={transfer}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma transferência pendente</h3>
                    <p className="text-muted-foreground">
                      Não há transferências aguardando aprovação no momento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-4">
                {mockRecentTransfers.map((transfer) => (
                  <TransferCard
                    key={transfer.id}
                    transfer={transfer}
                    showActions={false}
                  />
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Transferencias;
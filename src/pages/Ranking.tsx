import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Target, Shield, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockUser = {
  nickname: 'CraqueDoFlamengo',
  pointsTotal: 85,
};

const mockRankingData = {
  geral: [
    { id: '1', nickname: 'PalmeirasNaoTemMundial', pointsTotal: 127, position: 1, badge: 'Rei dos Palpites' },
    { id: '2', nickname: 'TricolorSP', pointsTotal: 118, position: 2, badge: 'Vidente' },
    { id: '3', nickname: 'CraqueDoFlamengo', pointsTotal: 85, position: 3, badge: 'Estrategista' },
    { id: '4', nickname: 'VascoDaGama', pointsTotal: 82, position: 4, badge: 'Consistente' },
    { id: '5', nickname: 'FogoLoko', pointsTotal: 76, position: 5, badge: 'Persistente' },
    { id: '6', nickname: 'TimaoFiel', pointsTotal: 71, position: 6, badge: 'Novato' },
    { id: '7', nickname: 'GaloForte', pointsTotal: 68, position: 7, badge: 'Aprendiz' },
    { id: '8', nickname: 'BahiaTricolor', pointsTotal: 64, position: 8, badge: 'Iniciante' },
  ],
  placarExato: [
    { id: '2', nickname: 'TricolorSP', exactScores: 8, position: 1 },
    { id: '1', nickname: 'PalmeirasNaoTemMundial', exactScores: 7, position: 2 },
    { id: '3', nickname: 'CraqueDoFlamengo', exactScores: 5, position: 3 },
    { id: '4', nickname: 'VascoDaGama', exactScores: 4, position: 4 },
  ],
  resultados: [
    { id: '1', nickname: 'PalmeirasNaoTemMundial', correctResults: 23, position: 1 },
    { id: '3', nickname: 'CraqueDoFlamengo', correctResults: 21, position: 2 },
    { id: '2', nickname: 'TricolorSP', correctResults: 20, position: 3 },
    { id: '4', nickname: 'VascoDaGama', correctResults: 19, position: 4 },
  ],
  timesInvictos: [
    { id: '5', nickname: 'FogoLoko', streak: 12, position: 1 },
    { id: '1', nickname: 'PalmeirasNaoTemMundial', streak: 8, position: 2 },
    { id: '3', nickname: 'CraqueDoFlamengo', streak: 6, position: 3 },
    { id: '2', nickname: 'TricolorSP', streak: 4, position: 4 },
  ],
};

const Ranking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('geral');
  const navigate = useNavigate();
  const itemsPerPage = 5;

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

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'Rei dos Palpites': 'bg-warning text-warning-foreground',
      'Vidente': 'bg-purple-500 text-white',
      'Estrategista': 'bg-primary text-primary-foreground',
      'Consistente': 'bg-accent text-accent-foreground',
      'Persistente': 'bg-secondary text-secondary-foreground',
      'Novato': 'bg-muted text-muted-foreground',
      'Aprendiz': 'bg-muted text-muted-foreground',
      'Iniciante': 'bg-muted text-muted-foreground',
    };
    return colors[badge] || 'bg-muted text-muted-foreground';
  };

  const filterData = (data: any[]) => {
    return data.filter(item => 
      item.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const paginateData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const RankingTable = ({ data, type }: { data: any[], type: string }) => {
    const filteredData = filterData(data);
    const paginatedData = paginateData(filteredData);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getMetricLabel = () => {
      switch (type) {
        case 'geral': return 'Pontos';
        case 'placarExato': return 'Placares Exatos';
        case 'resultados': return 'Resultados Corretos';
        case 'timesInvictos': return 'Sequência';
        default: return 'Métrica';
      }
    };

    const getMetricValue = (item: any) => {
      switch (type) {
        case 'geral': return item.pointsTotal;
        case 'placarExato': return item.exactScores;
        case 'resultados': return item.correctResults;
        case 'timesInvictos': return `${item.streak} jogos`;
        default: return 0;
      }
    };

    return (
      <div className="space-y-4">
        {paginatedData.map((item, index) => {
          const isCurrentUser = item.nickname === mockUser.nickname;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`shadow-card hover:shadow-elegant transition-all duration-300 ${
                isCurrentUser ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8">
                        {getPositionIcon(item.position)}
                      </div>
                      <Avatar>
                        <AvatarImage src={`/users/${item.id}.jpg`} />
                        <AvatarFallback>{item.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                          {item.nickname}
                          {isCurrentUser && <span className="text-sm text-muted-foreground ml-2">(Você)</span>}
                        </h3>
                        {type === 'geral' && item.badge && (
                          <Badge className={`text-xs ${getBadgeColor(item.badge)}`}>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{getMetricValue(item)}</p>
                      <p className="text-sm text-muted-foreground">{getMetricLabel()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold mb-2">Ranking</h1>
          <p className="text-muted-foreground">Veja como você se compara aos outros jogadores</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jogador..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="placarExato" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Placar Exato</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex items-center space-x-2">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="timesInvictos" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Invictos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-6">
            <RankingTable data={mockRankingData.geral} type="geral" />
          </TabsContent>

          <TabsContent value="placarExato" className="mt-6">
            <RankingTable data={mockRankingData.placarExato} type="placarExato" />
          </TabsContent>

          <TabsContent value="resultados" className="mt-6">
            <RankingTable data={mockRankingData.resultados} type="resultados" />
          </TabsContent>

          <TabsContent value="timesInvictos" className="mt-6">
            <RankingTable data={mockRankingData.timesInvictos} type="timesInvictos" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Ranking;
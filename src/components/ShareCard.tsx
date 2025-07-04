import { useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, Trophy, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareCardProps {
  user: {
    nickname: string;
    avatar?: string;
    pointsTotal: number;
    badge?: string;
  };
  roundPoints: number;
  exactScores: number;
  correctResults: number;
  hashtags?: string[];
}

export const ShareCard = ({
  user,
  roundPoints,
  exactScores,
  correctResults,
  hashtags = ['#PalpitesDaHora', '#Fantasy', '#Futebol']
}: ShareCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCard = async () => {
    setIsGenerating(true);
    
    try {
      const cardElement = document.getElementById('share-card');
      if (!cardElement) throw new Error('Card element not found');

      const canvas = await html2canvas(cardElement, {
        width: 1080,
        height: 1080,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      return canvas;
    } catch (error) {
      console.error('Error generating card:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCard = async () => {
    try {
      const canvas = await generateCard();
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'palpite-resultado.png', { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Meus Palpites da Hora',
              text: `Confira meu desempenho na rodada! ${hashtags.join(' ')}`,
              files: [file],
            });
            return;
          }
        }

        // Fallback: download da imagem
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'palpite-resultado.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Card baixado!',
          description: 'Sua imagem foi baixada com sucesso.',
        });
      }, 'image/png');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o card.',
        variant: 'destructive',
      });
    }
  };

  const downloadCard = async () => {
    try {
      const canvas = await generateCard();
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'palpite-resultado.png';
      link.href = url;
      link.click();
      
      toast({
        title: 'Card baixado!',
        description: 'Sua imagem foi baixada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o card.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div
          id="share-card"
          className="relative bg-gradient-primary p-8 rounded-3xl shadow-glow"
          style={{
            width: '540px',
            height: '540px',
            background: 'linear-gradient(135deg, hsl(20 100% 50%), hsl(265 49% 30%))',
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-8xl">⚽</div>
            <div className="absolute bottom-10 right-10 text-6xl">🏆</div>
            <div className="absolute top-1/2 right-10 text-7xl">⭐</div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between text-white">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Palpites da Hora</h1>
              <p className="text-xl opacity-90">Resultados da Rodada</p>
            </div>

            {/* User Info */}
            <div className="text-center space-y-6">
              <Avatar className="w-24 h-24 mx-auto border-4 border-white">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-bold text-primary bg-white">
                  {user.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-3xl font-bold">{user.nickname}</h2>
                {user.badge && (
                  <Badge className="mt-2 bg-white/20 text-white border-white/30">
                    {user.badge}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{roundPoints}</p>
                  <p className="text-sm opacity-90">Pontos</p>
                </div>
                <div>
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{exactScores}</p>
                  <p className="text-sm opacity-90">Placares Exatos</p>
                </div>
                <div>
                  <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-2xl">✓</div>
                  <p className="text-3xl font-bold">{correctResults}</p>
                  <p className="text-sm opacity-90">Resultados</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Total: {user.pointsTotal} pontos</p>
              <div className="flex flex-wrap justify-center gap-2">
                {hashtags.map((tag, index) => (
                  <span key={index} className="text-sm opacity-90">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center space-x-4"
      >
        <Button
          onClick={shareCard}
          disabled={isGenerating}
          className="bg-gradient-primary"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Compartilhar'}
        </Button>
        <Button
          variant="outline"
          onClick={downloadCard}
          disabled={isGenerating}
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar
        </Button>
      </motion.div>
    </div>
  );
};
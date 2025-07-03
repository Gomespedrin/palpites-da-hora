import { RankingTable } from "@/components/Ranking/RankingTable";

interface RankingProps {
  currentUserId: string;
}

// Mock data - substituir por dados reais
const mockUsers = [
  { id: "1", nickname: "CraqueDoFlaMengo", pointsTotal: 85 },
  { id: "2", nickname: "PalmeirasNaoTemMundial", pointsTotal: 72 },
  { id: "3", nickname: "TricolorSP", pointsTotal: 68 },
  { id: "4", nickname: "VascoDaGama", pointsTotal: 54 },
  { id: "5", nickname: "FogoLoko", pointsTotal: 43 },
  { id: "6", nickname: "TimaoFiel", pointsTotal: 38 },
  { id: "7", nickname: "GaloForte", pointsTotal: 32 },
  { id: "8", nickname: "BahiaTricolor", pointsTotal: 27 },
];

export const Ranking = ({ currentUserId }: RankingProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <RankingTable users={mockUsers} currentUserId={currentUserId} />
    </div>
  );
};
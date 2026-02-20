"use client"
import { useEffect, useState } from "react";
import { Ranking, RankingUser } from "@/lib/ranking";
import { FaTrophy } from "react-icons/fa6";

export default function RankingMain() {

    const [ranking, setRanking] = useState<RankingUser[]>([]);
    useEffect(() => {
  async function loadRanking() {
    const data = await Ranking();
    setRanking(data);
  }

  loadRanking();
}, []);

const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500 font-bold"; // Dourado
      case 1: return "text-slate-400 font-bold";  // Prata
      case 2: return "text-orange-600 font-bold"; // Bronze
      default: return "text-primary";             // Cor padrão
    }
  };

return (
    <>
    
        <main className="py-2 mb-10">
      <div className="mx-auto w-full max-w-2xl px-4">

        {ranking.map((user, index) => (
          <div
            key={user.id}
            className={`flex justify-between items-center border rounded-lg p-3 mt-2 transition-all ${
              index === 0 ? "border-yellow-500/50 bg-yellow-500/5" : "border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              {/* O Número com a cor dinâmica */}
              <span className={`text-lg ${getRankStyle(index)}`}>
                {index + 1}.
              </span>
              
              <span className="font-medium">
                {user.name}
              </span>
              
              {/* Ícone de troféu apenas para o primeiro */}
              {index === 0 && <FaTrophy className="h-4 w-4 text-yellow-500" />}
            </div>

            <div className="text-right">
              <span className="text-sm font-semibold text-primary">
                R$ {user.gastos.toFixed(2)}
              </span>
            </div>
          </div>
        ))}

    </div>

        </main>

    </>
);
}
"use client"
import { useEffect, useState } from "react";
import { Ranking, RankingUser } from "@/lib/ranking";

export default function RankingMain() {

    const [ranking, setRanking] = useState<RankingUser[]>([]);
    useEffect(() => {
  async function loadRanking() {
    const data = await Ranking();
    setRanking(data);
  }

  loadRanking();
}, []);

return (
    <>
    
        <main className="py-2">
      <div className="mx-auto w-full max-w-2xl px-4">

        <a href="" className="text-lg font-semibold">Ranking</a>
        <p className="text-sm text-muted-foreground">Confira o ranking de maiores compradores: </p>

        {ranking.map((user, index) => (
            <div
            key={user.id}
            className="flex justify-between border rounded-lg p-2 mt-2"
            >
            <span>
                {index + 1}. {user.name}
            </span>

            <span className="text-sm text-muted-foreground">
                {user.gastos} reais
            </span>
            </div>
        ))}

    </div>

        </main>

    </>
);
}
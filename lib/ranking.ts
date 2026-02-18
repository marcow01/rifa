import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type RankingUser = {
  id: string;
  name: string;
  totalNumbers: number;
  gastos: number;
};

export async function Ranking(): Promise<RankingUser[]> {
  const q = query(
    collection(db, "users"),
    orderBy("gastos", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<RankingUser, "id">),
  }));
}

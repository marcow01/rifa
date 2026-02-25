'use client';
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BanknoteArrowUp, DoorOpen, MoveLeft, CircleX, ClockFading } from "lucide-react"
import Navbar from "@/components/navbar"
import { useProfile } from "@/lib/useprofile"
import { collection, query, where, getDocs } from "firebase/firestore"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
            const { user }  = useProfile();
        const [loading, setLoading] = useState(true)
        const [payments, setPayments] = useState<any[]>([])
        const [totalAmount, setTotalAmount] = useState(0)
        const [usersList, setUsersList] = useState<any[]>([]);
        const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setAuthorized(true);
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
  async function fetchDashboardData() {
    if (!user) return;

    try {
      // 1. BUSCAR PAGAMENTOS (Apenas os pagos)
      const qPay = query(collection(db, "payments"), where("status", "==", "paid"));
      const snapPay = await getDocs(qPay);
      
      let totalValue = 0;
      const listPay = snapPay.docs.map(doc => {
        const data = doc.data();
        totalValue += Number(data.amount) || 0;
        return { id: doc.id, ...data };
      });

      // 2. BUSCAR TODOS OS USUÁRIOS
      const snapUser = await getDocs(collection(db, "users"));
      const listUser = snapUser.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 3. ATUALIZAR TODOS OS ESTADOS DE UMA VEZ
      setPayments(listPay);
      setTotalAmount(totalValue);
      setUsersList(listUser);
      setTotalUsers(listUser.length);

    } catch (error) {
      console.error("Erro no Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchDashboardData();
}, [user]);

  if (!authorized) return <p className="p-4">Carregando painel de controle...</p>;

  const chartData = payments.map((p) => ({
    name: p.debtor || "Cliente",
    valor: Number(p.amount),
  }));

  return (
  <>
    <Navbar />

    <div className="flex items-center justify-center">
      <Card className="w-full max-w-2xl border-none shadow-none p-2 mt-2 ring-0 space-y-4">

        {/* ===== MÉTRICAS ===== */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Arrecadado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">
                R$ {totalAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-700">
                {totalUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Confirmados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-700">
                {payments.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ===== GRÁFICO ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Recebidos</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#15803d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ===== ÚLTIMOS PAGAMENTOS ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border rounded-xl p-3"
              >
                <div>
                  <p className="font-semibold">
                    R$ {Number(payment.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.debtor}
                  </p>
                </div>

                <Badge className="bg-green-700">{payment.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ===== USUÁRIOS ===== */}
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersList.slice(0, 5).map((userI) => (
              <div
                key={userI.id}
                className="flex items-center gap-3 p-2 border rounded-xl"
              >
                <Avatar>
                  <AvatarImage src={userI.photoURL} />
                  <AvatarFallback>
                    {userI.name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{userI.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {userI.email}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ===== BOTÃO ===== */}
        <div className="flex">
          <Button className="flex-1" onClick={() => router.push("/")}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

      </Card>
    </div>
  </>
);
}
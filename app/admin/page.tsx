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

  return (
        <>
            <Navbar></Navbar>




            
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl border-none shadow-none p-2 mt-2 ring-0">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
  
  {/* Coluna 1: Total Arrecadado */}
  <Card className="p-4">
    <CardHeader className="p-0">
      <CardTitle className="text-lg font-semibold">Total arrecadado</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        R${totalAmount.toFixed(2)}

        {payments.map((payment) => (
      <div
        key={payment.id}
        className="flex items-center justify-between rounded-xl border px-4 py-2 mt-2"
      >
        <div className="flex items-center gap-3">
          {payment.status === "paid" && (
            <div className="bg-green-200 p-2 rounded-sm">
              <BanknoteArrowUp className="h-5 w-5 text-green-500" />
            </div>
          )}
    
          {payment.status === "pending" && (
            <div className="bg-yellow-200 p-2 rounded-sm">
              <ClockFading className="h-5 w-5 text-yellow-500" />
            </div>
          )}
    
          {payment.status === "expired" && (
            <div className="bg-red-200 p-2 rounded-sm">
              <CircleX className="h-5 w-5 text-red-500" />
            </div>
          )}
    
          <div>
            <p className="text-sm font-medium">R${payment.amount}</p>
            <p className="text-sm text-muted-foreground">{payment.status}</p>
            <p className="text-sm text-muted-foreground">{payment.calendar}</p>
            <p className="text-sm text-muted-foreground">{payment.debtor}</p>
          </div>
        </div>
      </div>
    ))}
      </CardDescription>
    </CardHeader>
  </Card>

  {/* Coluna 2: Total de Usuários */}
  <Card className="p-4">
    <CardHeader className="p-0">
      <CardTitle className="text-lg font-semibold">Total de usuários</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        {totalUsers}
        
        <div className="mt-4">
                    {usersList.map((userI) => (
            <div key={userI.id} className="">
                {userI.photoURL}
                {userI.name}
            </div>
            ))}
        </div>

      </CardDescription>
    </CardHeader>
  </Card>

  

</div>

              <div className="flex">
                <Button className="flex-1" onClick={() => router.push("/")}><MoveLeft></MoveLeft>Voltar</Button>
              </div>
            
          </Card>
        </div>
        </>
  );
}
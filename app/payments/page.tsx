"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BanknoteArrowUp, DoorOpen, MoveLeft, CircleX, ClockFading } from "lucide-react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { useProfile } from "@/lib/useprofile"
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export default function Page() {

    const router = useRouter()

        const { user }  = useProfile();
        const [loading, setLoading] = useState(true)
        const [payments, setPayments] = useState<any[]>([])

useEffect(() => {
  async function fetchPayments() {
    if (!user) return

    const q = query(
      collection(db, "payments"),
      where("userid", "==", user.uid)
    )

    const snapshot = await getDocs(q)

    const list: any[] = []
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() })
    })

    setPayments(list)
    setLoading(false)
  }

  fetchPayments()
}, [user])

  return (
    <>
        <Navbar></Navbar>

        
    <div className="bg-background flex items-center justify-center">
      <Card className="w-full max-w-2xl rounded-sm border-none shadow-none ring-0">

        <CardContent className="space-y-2">
 <a href="" className="text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-extrabold tracking-tight text-primary leading-tight">Transações</a>
        <p className="mt-2 text-sm md:text-sm mb-2 text-muted-foreground font-medium">Histórico de Participações: Aqui você acompanha o status de cada pedido realizado. Verifique se o seu pagamento foi confirmado para garantir sua posição no ranking e seus títulos para o sorteio. Pagamentos via Pix são processados instantaneamente.</p>

          {/* item */}
{payments.map((payment) => (
  <div
    key={payment.id}
    className="flex items-center justify-between rounded-xl border px-4 py-2"
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



          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => router.push("/")}><MoveLeft></MoveLeft>Voltar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}

"use client"

import  Navbar from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, ShieldCheck, Settings, DoorOpen, MoveLeft, Phone, Calendar, FileUser, Clock, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/lib/useprofile"
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Page() {

    const router = useRouter();
    const { user }  = useProfile();
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
    async function fetchUser() {
      if (!user) return

      const ref = doc(db, "users", user?.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        setUserData(snap.data())
      }

      setLoading(false)
    }

    fetchUser()
  }, [user])

  if (!user || loading) return null


const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/"); // melhor que push pra logout
  } catch (err) {
    console.error("Erro ao sair:", err);
  }
};
  return (

    <>
    
    <Navbar></Navbar>

    <div className="bg-background flex items-center justify-center">
      <Card className="w-full max-w-2xl rounded-sm border-none shadow-none ring-0">
        {/* HEADER */}
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.photoURL ?? undefined} alt={userData.name} />
            <AvatarFallback></AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="">{userData.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {user.email}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* item */}
          <div className="flex items-center justify-between rounded-xl border pr-4 pl-4 pt-2 pb-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
            </div>

          </div>

          {/* item */}
          <div className="flex items-center justify-between rounded-xl border pr-4 pl-4 pt-2 pb-2">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">{userData.phone}</p>
              </div>
            </div>
          </div>

          
          {/* item */}
          <div className="flex items-center justify-between rounded-xl border pr-4 pl-4 pt-2 pb-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Nascimento</p>
                <p className="text-sm text-muted-foreground">{userData.nascimento}</p>
              </div>
            </div>
          </div>

                    {/* item */}
          <div className="flex items-center justify-between rounded-xl border pr-4 pl-4 pt-2 pb-2">
            <div className="flex items-center gap-3">
              <FileUser className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">CPF</p>
                <p className="text-sm text-muted-foreground">{userData.cpf}</p>
              </div>
            </div>
          </div>

          {/* item */}
          <div className="flex items-center justify-between rounded-xl border pr-4 pl-4 pt-2 pb-2">
            <div className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Gastos</p>
                <p className="text-sm text-muted-foreground">R${userData.gastos}</p>
              </div>
            </div>
          </div>

          {/* item */}
          <div className="flex items-center justify-between rounded-xl border pr-4 pl-4 pt-2 pb-2">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Criação</p>
                <p className="text-sm text-muted-foreground">{userData.createdAt?.toDate().toLocaleString()}</p>
              </div>
            </div>
          </div>


          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => router.push("/")}><MoveLeft></MoveLeft>Voltar</Button>
            <Button variant="destructive" className="flex-1" onClick={handleLogout}>
                <DoorOpen></DoorOpen>
              Sair
            </Button>
          </div>
        </CardContent>  
      </Card>
    </div>
    </>
    
  )
}

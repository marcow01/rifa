"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Minus, Plus, ArrowRight, Trash2, Info, Loader2, ShoppingBasket, Trophy } from "lucide-react"
import { FaTrophy } from "react-icons/fa6";
import { useState } from "react";
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { onSnapshot } from "firebase/firestore";
import { useProfile } from "@/lib/useprofile";
import { QRCodeSVG } from "qrcode.react";
import Timer from "@/components/timer"
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Main() {

    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);
    const { user, hasProfile } = useProfile();
    const [loading, setLoading] = useState(false);

    async function getuser(userid: string) {
        const ref = doc(db, "users", userid)
        const snap = await getDoc(ref)

        if (!snap.exists()) return null
        return snap.data()

    }

const handleLogin = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        setLoginOpen(false); 
    } catch (error) {
        console.error("Erro ao fazer login:", error);
    }
};

    const [value, setValue] = useState(1980)

async function enviarpagamento() {
    if (!user || !hasProfile) {
        setLoginOpen(true);
        return;
    }

    setLoading(true);

    try {
        const dadosusuario = await getuser(user.uid);

        if (!dadosusuario) {
            setLoginOpen(true);
            setLoading(false);
            return;
        }

        const res = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: value * 0.01,
                external_id: crypto.randomUUID(),
                payer: {
                    name: dadosusuario.name,
                    document: dadosusuario.cpf,
                    email: dadosusuario.email,
                },
            }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro ao gerar Pix");

        const idtransacao = data.transactionId;

        // 🔥 Salva no Firestore
        await setDoc(doc(db, "payments", idtransacao), {
            status: "pending",
            calendar: data.calendar?.dueDate,
            debtor: data.debtor?.document,
            amount: data.amount,
            id: idtransacao,
            qrcode: data.qrcode,
            createdAt: new Date(),
            userid: user.uid,
            startNumber: data.numbersInterval.startNumber,
            endNumber: data.numbersInterval.endNumber,
            payerName: data.debtor?.name
        });

        // 🚀 Redireciona para página de pagamento
        router.push(`/checkout/${idtransacao}`);

    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        alert("Ocorreu um erro ao gerar o seu Pix. Tente novamente.");
    } finally {
        setLoading(false);
    }
}

  return (
    <main className="py-2">
      <div className="mx-auto w-full max-w-2xl px-4">

        <div className="relative w-full h-[300px] overflow-hidden rounded-2xl group">
  {/* A Imagem de Fundo */}
  <img
    src="/banner.jpg" 
    alt="banner sorteio"
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  />

  {/* O Overlay (Gradiente para dar leitura ao texto) */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

  {/* O Conteúdo Sobreposto */}
  <div className="absolute inset-0 flex flex-col justify-end p-6">
    {/* <span className="text-white text-sm font-nromal tracking-wider">
      Campanhas em destaque
    </span> */}
    <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight">
      Concorra a mais de R$ 1.000,00 <br/> por apenas R$ 0,01!
    </h2>
    <p className="text-gray-200 text-sm mt-2 font-medium">
     Adquira já o seu bilhete da sorte!
    </p>
  </div>
</div>

        <div className="grid grid-cols-3 gap-2 mt-2">

            {Array.from({ length: 3 }).map((_, i) => {
            const amount = 200 * (i + 1);

            return (
                <button key={i} onClick={() => setValue((v) => v + amount)} className="cursor-pointer">
                    <Card 
          className={`rounded-xl transition hover:opacity-80 active:scale-[0.98] 
            ${i === 1 ? 'bg-green-700 text-white' : 'bg-primary text-secondary'}`}
        >
                        <CardHeader>
                        <CardTitle className="font-bold text-3xl">+{amount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-sm sm:text-base md:text-lg ${i === 1 ? 'text-white' : 'text-muted-foreground'}`}>SELECIONAR</p>
                        </CardContent>
                    </Card>
                </button>
            );
            })}

        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">

            {Array.from({ length: 3 }).map((_, i) => {
            const amount = 500 + ((i + 1) * 500);

            return (
                <button key={i} onClick={() => setValue((v) => v + amount)} className="cursor-pointer">
                    <Card className="rounded-xl transition hover:opacity-80 active:scale-[0.98] bg-primary text-secondary">
                        <CardHeader>
                        <CardTitle className="font-bold text-3xl">+{amount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg text-center text-muted-foreground">SELECIONAR</p>
                        </CardContent>
                    </Card>
                </button>
            );
            })}

        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-2 mt-2">


            <div className="flex items-center gap-2 rounded-xl border p-2 justify-center">
                
                <div>
                    <Button size="icon" variant="ghost" onClick={() => setValue((v) => 1980)} className="cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setValue((v) => Math.max(10, v - 1)) }
            disabled={value <= 1980} className="cursor-pointer">
                        <Minus className="h-4 w-4" />
                    </Button>
                </div>


                <div className="min-w-[80px] text-center text-base font-medium">
                    {value}
                </div>


                <Button size="icon" variant="ghost" onClick={() => setValue((v) => v + 1)} className="cursor-pointer">
                    <Plus className="h-4 w-4" />
                </Button>

            </div>

            <Button
    className="flex items-center justify-center gap-2 rounded-xl p-6 min-w-[200px] bg-green-700 cursor-pointer"
    onClick={enviarpagamento}
    disabled={loading} // Impede cliques duplos enquanto processa
>
    {loading ? (
        <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
        </>
    ) : (
        <>
            <ArrowRight className="h-4 w-4" />
            Participar R${(value * 0.01).toFixed(2)}
        </>
    )}
</Button>


        </div>

                <Button onClick={() => router.push("/payments")} className="flex items-center gap-2 rounded-lg p-4 justify-center mt-2 mb-6 bg-gray-200 text-primary w-full cursor-pointer">
            <ShoppingBasket className="h-4 w-4 "/>
            Minhas transações
        </Button>

        <div className="flex justify-center">
            <img src="/ranking.png" alt="" className="w-[50%]"/>
        </div>

        {/* <div className="flex justify-center gap-2 mt-10 items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-extrabold tracking-tight text-primary leading-tight">
                <a>Disputa Ranking</a>
                <FaTrophy/>
            </div> */}

      </div>


<Dialog open={loginOpen} onOpenChange={setLoginOpen}>
  <DialogContent className="sm:max-w-[400px] p-8">
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      
      <DialogTitle className="text-2xl font-bold">
        {!user ? "Acesse sua conta" : "Quase lá!"}
      </DialogTitle>

      <p className="text-muted-foreground">
        {!user 
          ? "Realize o login ou faça seu cadastro na plataforma. Clique no ícone de perfil no cabeçalho para ter acesso." 
          : "Aguarde..."}
      </p>
    </div>
  </DialogContent>
</Dialog>


    </main>
  );
}

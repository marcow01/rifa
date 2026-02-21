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
    const [open, setOpen] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    useEffect(() => {
        if (!transactionId) return;

        const ref = doc(db, "payments", transactionId);

        const unsubscribe = onSnapshot(ref, (snap) => {
            const data = snap.data();

            if (data?.status === "paid") {
            setOpen(false); 
            }
        });

        return () => unsubscribe();
    }, [transactionId]);

    async function getuser(userid: string) {
        const ref = doc(db, "users", userid)
        const snap = await getDoc(ref)

        if (!snap.exists()) return null
        return snap.data()

    }

const handleLogin = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        setLoginOpen(false); // Fecha o modal após o login
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
                // Removi a postbackUrl fixa daqui pois sua API já monta ela usando env
                payer: {
                    name: dadosusuario.name,
                    document: dadosusuario.cpf,
                    email: dadosusuario.email,
                },
            }),
        });

        const data = await res.json();
        
        // Verifica se a API retornou erro antes de prosseguir
        if (!res.ok) throw new Error(data.error || "Erro ao gerar Pix");

        setPaymentData(data);
        const idtransacao = data.transactionId;
        setTransactionId(idtransacao);

        // SALVANDO NO BANCO COM O INTERVALO
        await setDoc(doc(db, "payments", idtransacao), {
            status: "pending",
            calendar: data.calendar.dueDate,
            debtor: data.debtor.document,
            amount: data.amount,
            id: idtransacao,
            createdAt: new Date(),
            userid: user.uid,
            // AQUI ESTÃO OS NOVOS CAMPOS QUE VÊM DA SUA API:
            startNumber: data.numbersInterval.startNumber,
            endNumber: data.numbersInterval.endNumber,
        });

        setOpen(true); 
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

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 mt-4">

            {Array.from({ length: 3 }).map((_, i) => {
            const amount = 200 * (i + 1);

            return (
                <button key={i} onClick={() => setValue((v) => v + amount)}>
                    <Card 
          className={`rounded-xl transition hover:opacity-80 active:scale-[0.98] 
            ${i === 1 ? 'bg-green-700 text-white' : 'bg-primary text-secondary'}`}
        >
                        <CardHeader>
                        <CardTitle className="font-bold text-3xl">+{amount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-lg text-center ${i === 1 ? 'text-white' : 'text-muted-foreground'}`}>SELECIONAR</p>
                        </CardContent>
                    </Card>
                </button>
            );
            })}

        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 mt-2">

            {Array.from({ length: 3 }).map((_, i) => {
            const amount = 500 + ((i + 1) * 500);

            return (
                <button key={i} onClick={() => setValue((v) => v + amount)}>
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
                    <Button size="icon" variant="ghost" onClick={() => setValue((v) => 1980)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setValue((v) => Math.max(10, v - 1))}
            disabled={value <= 1980}>
                        <Minus className="h-4 w-4" />
                    </Button>
                </div>


                <div className="min-w-[80px] text-center text-base font-medium">
                    {value}
                </div>


                <Button size="icon" variant="ghost" onClick={() => setValue((v) => v + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>

            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                
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

<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        
<DialogTitle className="">
    </DialogTitle>

  {!paymentData ? (
    <p>Gerando pagamento...</p>
  ) : (
    <>        

    <div>
        
    <Timer dueDate={paymentData?.calendar?.dueDate} />

    <div className="relative w-full h-[200px] overflow-hidden rounded-xl group mt-4">
  {/* A Imagem de Fundo */}
  <img
    src="/banner2.jpg" 
    alt="Prêmio Principal"
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
        
    </h2>
    <p className="text-gray-200 text-sm mt-2 font-medium">
     Realize o pagamento pra obter seus números.
    </p>
  </div>
</div>
    

    </div>

        <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-2">
  

  <div className="p-4 flex justify-center">

    
          <QRCodeSVG
        value={paymentData.qrcode}
        size={200}
    />

  </div>

  <div className="">

    <div>

        <div className="mt-2 flex items-center">

            <div className="rounded-sm p-4 w-6 h-6 bg-primary text-white text-center flex justify-center items-center mr-2">
                <p>1</p>
            </div>
            <a className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">Copie o código PIX abaixo.</a>

        </div>

            <div className="border p-2 rounded-sm mt-2">
                <span className="text-sm text-muted-foreground">
                    {paymentData.qrcode}
                </span>
            </div>

            <Button className="w-full mt-2" onClick={() => navigator.clipboard.writeText(paymentData.qrcode)}> 
                Copiar código pix
            </Button>


            <div className="mt-2 flex items-center">

                <div className="rounded-sm p-4 w-6 h-6 bg-primary text-white text-center flex justify-center items-center mr-2">
                    <p>2</p>
                </div>
                <a className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">Abra o app do seu banco e escolha a opção PIX, como se fosse fazer uma transferência.</a>

            </div>


        <div className="mt-2 flex items-center">

            <div className="rounded-sm p-4 w-6 h-6 bg-primary text-white text-center flex justify-center items-center mr-2">
                <p>3</p>
            </div>
            <a  className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">Selecione a opção PIX cópia e cola, cole a chave copiada e confirme o pagamento.</a>

        </div>

      </div>

  </div>

</div>

<div className="mt-4 p-4 rounded-lg space-y-4">
  
  {/* ID */}
  <p className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">
    ID <span className="font-normal tracking-tight leading-tight text-primary ml-1">
      {paymentData.transactionId}
    </span>
  </p>

  {/* Valor */}
  <p className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">
    Valor a Pagar <span className="font-normal tracking-tight leading-tight text-primary ml-1">
      R$ {paymentData.amount.toFixed(2)}
    </span>
  </p>

  {/* CPF */}
  <p className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">
    CPF do Pagador <span className="font-normal tracking-tight leading-tight text-primary ml-1">
      {paymentData.debtor?.document}
    </span>
  </p>

  {/* Nome */}
  <p className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">
    Nome no Registro <span className="font-normal tracking-tight leading-tight text-primary ml-1">
      {paymentData.debtor?.name || "Não informado"}
    </span>
  </p>

  {/* Vencimento */}
  <p className="text-sm md:text-lg font-extrabold tracking-tight leading-tight text-primary">
    Vencimento Original <span className="font-normal tracking-tight leading-tight text-primary ml-1">
      {paymentData.calendar?.dueDate}
    </span>

    <p className="text-xs text-muted-foreground italic mt-4">
    * Verifique se os dados acima conferem antes de confirmar no app do seu banco.
  </p>
  </p>

</div>
    </>
  )}
</DialogContent>
            </Dialog>

        </div>

                <Button onClick={() => router.push("/payments")} className="flex items-center gap-2 rounded-lg p-4 justify-center mt-2 mb-6 bg-gray-200 text-primary w-full cursor-pointer">
            <ShoppingBasket className="h-4 w-4 "/>
            Minhas transações
        </Button>

        <div className="flex justify-center gap-2 mt-10 items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-extrabold tracking-tight text-primary leading-tight">
                <a>Disputa Ranking</a>
                <FaTrophy/>
            </div>

            {/* Subtítulo */}
            <p className="text-center mt-2 text-sm md:text-sm mb-2 text-muted-foreground font-medium max-w-[600px] mx-auto">
                O Primeiro colocado tem chances extras de ganhar! E fique tranquilo, caso não ganhe, o valor será devolvido integralmente. Confira todos os detalhes em nossos <span className="font-bold text-primary">Termos e Condições.</span>
            </p>

      </div>


<Dialog open={loginOpen} onOpenChange={setLoginOpen}>
  <DialogContent className="sm:max-w-[400px] p-8">
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      
      <DialogTitle className="text-2xl font-bold">
        {!user ? "Acesse sua conta" : "Quase lá!"}
      </DialogTitle>

      <p className="text-muted-foreground">
        {!user 
          ? "Para reservar seus números, você precisa entrar na sua conta. Optar pela conta do Google garante segurança no tratamento do seus dados!" 
          : "Seu login foi feito, mas precisamos de alguns dados (CPF/Telefone) para gerar o seu Pix."}
      </p>

      {!user ? (
        /* BOTÃO 1: Se não estiver logado */
        <Button 
          onClick={handleLogin} 
          className="w-full py-6 text-lg flex gap-3 mt-2"
          variant="outline"
        >
            <FaGoogle />
          Entrar com Google
        </Button>
      ) : (
        /* BOTÃO 2: Se estiver logado mas sem perfil */
        <>
        <p>Clique na sua foto de perfil, depois em 'Completar cadastro' para adicionar as informações adicionais.</p>
        </>
      )}
    </div>
  </DialogContent>
</Dialog>


    </main>
  );
}

"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Minus, Plus, ArrowRight, Trash2, Info, Loader2 } from "lucide-react"
import { useState } from "react";
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { onSnapshot } from "firebase/firestore";
import { useProfile } from "@/lib/useprofile";
import { QRCodeSVG } from "qrcode.react";
import Timer from "@/components/timer"
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Main() {

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
        // Busca manual para garantir que pegamos o cadastro mais recente
        const dadosusuario = await getuser(user.uid);

        if (!dadosusuario) {
            // Se REALMENTE não houver cadastro no banco, abre o aviso
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
                postbackUrl: "https://0f9f-177-104-241-8.ngrok-free.app/api/webhook",
                payerQuestion: "pag. rifa",
                payer: {
                    name: dadosusuario.name,
                    document: dadosusuario.cpf,
                    email: dadosusuario.email,
                },
            }),
        });

        const data = await res.json();
        
        // Seta os dados para o Modal
        setPaymentData(data);
        const idtransacao = data.transactionId;
        setTransactionId(idtransacao);

        // Salva no banco
        await setDoc(doc(db, "payments", idtransacao), {
            status: "pending",
            calendar: data.calendar.dueDate,
            debtor: data.debtor.document,
            amount: data.amount,
            id: idtransacao,
            createdAt: new Date(),
            userid: user.uid,
        });

        setOpen(true); // Abre o modal apenas quando tudo estiver pronto
    } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        alert("Ocorreu um erro ao gerar o seu Pix. Tente novamente.");
    } finally {
        setLoading(false); // Desativa o spin mesmo em caso de erro
    }
}

  return (
    <main className="py-2">
      <div className="mx-auto w-full max-w-2xl px-4">

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 3 }).map((_, i) => {
            const amount = 200 * (i + 1);

            return (
                <button key={i} onClick={() => setValue((v) => v + amount)}>
                    <Card className="rounded-xl transition hover:opacity-80 active:scale-[0.98]">
                        <CardHeader>
                        <CardTitle>+{amount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Selecionar</p>
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
                    <Card className="rounded-xl transition hover:opacity-80 active:scale-[0.98]">
                        <CardHeader>
                        <CardTitle>+{amount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Selecionar</p>
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
    className="flex items-center justify-center gap-2 rounded-xl p-6 min-w-[200px]"
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
        
<DialogTitle>
    <div className="text-center">
        <p>Realize o pagamento pra continuar</p>
    </div>
    </DialogTitle>

  {!paymentData ? (
    <p>Gerando QR Code...</p>
  ) : (
    <>        

    <div>
        
    <Timer dueDate={paymentData?.calendar?.dueDate} />
    

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
            <a>Copie o código PIX abaixo.</a>

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
                <a>Abra o app do seu banco e escolha a opção PIX, como se fosse fazer uma transferência.</a>

            </div>


        <div className="mt-2 flex items-center">

            <div className="rounded-sm p-4 w-6 h-6 bg-primary text-white text-center flex justify-center items-center mr-2">
                <p>3</p>
            </div>
            <a>3. Selecione a opção PIX cópia e cola, cole a chave copiada e confirme o pagamento.</a>

        </div>

      </div>

  </div>

</div>

        <div className="mt-4 p-4 rounded-lg space-y-2 border">
  <p className="text-sm">
    <span className="font-semibold">ID</span> {paymentData.transactionId}
  </p>
  
  <p className="text-sm">
    <span className="font-semibold">Status Atual:</span> 
    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
      {paymentData.status}
    </span>
  </p>

  <p className="text-sm">
    <span className="font-semibold">Valor a Pagar:</span> 
    <span className="text-primary font-bold"> R$ {paymentData.amount.toFixed(2)}</span>
  </p>

  <p className="text-sm">
    <span className="font-semibold">CPF do Pagador:</span> {paymentData.debtor?.document}
  </p>

  <p className="text-sm">
    <span className="font-semibold">Nome no Registro:</span> {paymentData.debtor?.name || "Não informado"}
  </p>

  <p className="text-sm">
    <span className="font-semibold">Vencimento Original:</span> {paymentData.calendar?.dueDate}
  </p>

  <p className="text-xs text-muted-foreground italic mt-2">
    * Verifique se os dados acima conferem antes de confirmar no app do seu banco.
  </p>
</div>

    </>
  )}
</DialogContent>
            </Dialog>

        </div>

        <div className="flex items-center gap-2 rounded-lg border p-2 justify-center mt-2">
                
            <a>Consulte o regulamento</a>

        </div>

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

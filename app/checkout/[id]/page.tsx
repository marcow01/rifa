"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code"
import  Navbar from "@/components/navbar";
import { Clipboard, Loader, Info, CircleCheck, MoveLeft } from 'lucide-react';
import Timer from "@/components/timer"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PaymentPage() {

  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const res = await fetch(`/api/payment/${id}`)

        if (!res.ok) {
          setPaymentData(null)
          return
        }

        const data = await res.json()
        setPaymentData(data)

      } catch (error) {
        console.error("Erro ao buscar pagamento:", error)
        setPaymentData(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPayment()
  }, [id])

useEffect(() => {
  if (!id) return;

  const ref = doc(db, "payments", id);

  const unsubscribe = onSnapshot(ref, (snap) => {
    const data = snap.data();

    if (data?.status === "paid") {
      setPaid(true);
      // setOpen(false);
    }
  });

  return () => unsubscribe();
}, [id]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-5 w-5 animate-spin mr-2" />
        <p>Carregando pagamento...</p>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pagamento não encontrado.</p>
      </div>
    )
  }

function formatCpf(cpf: string) {
  if (!cpf) return "";

  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return cpf;

  const firstThree = cleaned.slice(0, 3);

  return `${firstThree}.***.***-**`;
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

  return (

    <>
      <Navbar />

      <div className="min-h-[80vh] flex justify-center p-4 mb-16">
        <div className="mx-auto w-full max-w-xl">

          {paid && (

            <>

            <div className="bg-green-100 border border-green-600 text-green-700 p-4 rounded-lg text-center font-bold mt-4 flex gap-2 justify-center">
              <CircleCheck/> 
              <div>

                <p>Pagamento confirmado! Seus números foram gerados.</p>
                <p className="text-xs text-muted-foreground">Confira seus títulos na aba de transações.</p>
                
              </div>
            </div>

                      <div className="flex gap-3 mt-2 cursor-pointer">
            <Button className="flex-1" onClick={() => router.push("/")}><MoveLeft></MoveLeft>Voltar</Button>
          </div>

            </>

          )}
          
          {!paid && (

            <>


          <div className="p-2 flex gap-2 items-center justify-center mb-4">

            <Loader className="h-5 w-5 animate-spin" />
            <h1 className="font-bold">Finalizando pagamento...</h1>

          </div>

          {/* <Timer dueDate={paymentData?.calendar?.dueDate} /> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coluna 1 */}
            <div className="flex justify-center w-full">
              <div className="flex flex-col items-center gap-4">
                
                <div className="">
                  {paymentData?.qrcode && (
                    <QRCode value={paymentData.qrcode} size={200} />
                  )}
                </div>

                {/* <div className="text-center space-y-1">
                  <p className="font-bold">Escaneie o QR Code</p>
                </div> */}

              </div>
            </div>

            {/* Coluna 2 */}
            <div>

              <div className="flex gap-2 items-center">

                <Info className="h-5 w-5" />
                <h1 className="font-bold">Detalhes da sua compra</h1>

              </div>

              <p className="text-xs text-muted-foreground mb-4">{paymentData.id}</p>
              
              <p className="font-bold text-4xl text-green-700 mb-2">R$ {paymentData.amount}</p>
              <p><span className="font-bold">Comprador: </span>{paymentData.payerName}</p>
              <p><span className="font-bold">CPF: </span>{formatCpf(paymentData.debtor)}</p>
              <p><span className="font-bold">Data: </span>{formatDate(paymentData.calendar)}</p>
              <p><span className="font-bold">Número de fichas: </span>{(paymentData.amount) * 100}</p>
              <p><span className="font-bold">Títulos: </span> Os títulos são liberados após o pagamento</p>

            </div>
          </div>

          <div className="space-y-3">

            <div className="flex gap-3 items-center">
              <div className="bg-primary text-secondary w-8 h-8 flex items-center justify-center rounded-sm font-bold">
                1
              </div>
              <p className="text-sm font-medium">Copie o código PIX abaixo.</p>
            </div>
            
            <div className="border rounded-xl p-4 bg-muted/50 break-all text-center">
              <span className="text-xs md:text-sm font-mono text-muted-foreground">
                {paymentData.qrcode}
              </span>
            </div>

            <Button
              className="w-full h-10 text-base font-bold bg-green-700 hover:bg-green-800"
              onClick={() => {
                navigator.clipboard.writeText(paymentData.qrcode);
                alert("Código Pix copiado!");
              }}
            >
              <Clipboard />
              Copiar código Pix
            </Button>

            <div className="flex gap-3 items-center">
              <div className="bg-primary text-secondary w-8 h-8 flex items-center justify-center rounded-sm font-bold">
                2
              </div>
              <p className="text-sm font-medium">Abra o app do seu banco e escolha a opção PIX, como se fosse fazer uma transferência.</p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="bg-primary text-secondary w-8 h-8 flex items-center justify-center rounded-sm font-bold">
                3
              </div>
              <p className="text-sm font-medium">Selecione a opção PIX cópia e cola, cole a chave copiada e confirme o pagamento.</p>
            </div>
          </div>


            </>
          )}
          
        </div>
      </div>
    </>

  )
}
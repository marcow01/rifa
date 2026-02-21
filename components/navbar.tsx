"use client";

import { Headset, Menu, UserRound, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useUser } from "@/lib/user";
import AvatarMenu from "@/components/avatar";
import { useState } from "react";
// 1. Importar componentes do Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Navbar() {
  const { user, loading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // 2. Estado para o suporte (opcional, mas bom se quiser fechar via código)
  const [supportOpen, setSupportOpen] = useState(false);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("Erro no login:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-secondary">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* esquerda */}
        <Button variant="ghost" size="icon" asChild className="transition hover:opacity-80 active:scale-[0.98]">
          <Link href="/">
            <Menu className="h-5 w-5" />
          </Link>
        </Button>

        {/* centro */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <Link href="/" className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
            1 CENTAVO 1000 NO PIX HOJE!
          </Link>
        </div>

        {/* direita */}
        <div className="flex items-center gap-2">
          
          {/* 3. Implementação do Dialog de Suporte */}
          <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="transition hover:opacity-80 active:scale-[0.98] cursor-pointer">
                <Headset className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="bg-green-700 p-2 rounded-lg flex items-center justify-center">
    <Headset className="h-5 w-5 text-white" />
  </div>
                  Suporte ao Participante
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 text-primary">
                <p className="text-sm md:text-base font-medium leading-relaxed">
                  Dúvidas sobre o sorteio ou seu pagamento? Nossa equipe está pronta para te ajudar a garantir sua participação agora mesmo!
                </p>
                <div className="p-4 rounded-">
                  <p className="text-sm text-muted-foreground italic">
                    Nosso atendimento funciona de segunda a sexta, das 08h às 18h. 
                    Pagamentos via pix são processados automaticamente em até 5 minutos.
                  </p>
                </div>
                <Button className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-6 rounded-xl">
                  Falar no WhatsApp
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {!user && (
            <Button variant="ghost" size="icon" onClick={login} className="cursor-pointer">
              <UserRound className="h-5 w-5" />
            </Button>
          )}

          {user && <AvatarMenu />}
        </div>
      </nav>
    </header>
  );
}
"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useState } from "react";
import { LogOut, PenLine, FileText, ExternalLink, Wallet, ListOrdered, Settings} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useprofile";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { PatternFormat } from "react-number-format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AvatarMenu({ 
  forceOpen, 
  setForceOpen 
}: { 
  forceOpen?: boolean; 
  setForceOpen?: (val: boolean) => void 
}) {

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  // Função para fechar que avisa o Main
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val && setForceOpen) setForceOpen(false);
  };

  const profileSchema = z.object({
  name: z.string().min(5, "Nome muito curto"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().refine((val) => cpfValidator.isValid(val), {
    message: "CPF inválido",
  }),
  nascimento: z.string().min(1, "Data de nascimento obrigatória"),
});

  const router = useRouter();
  const [open, setOpen] = useState(false)
  const { user, hasProfile } = useProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!user) return null;

  const send = async () => {
  if (!user) return

  const result = profileSchema.safeParse({ name, phone, cpf, nascimento });
    
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      alert(firstError); 
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    
  try { 
    
    await setDoc(doc(db, "users", user.uid), {
    name,
    cpf,
    nascimento,
    phone,
    email: user.email,
    gastos: 0,
    compras: [],
    createdAt: new Date(),
  })

setStatus("success");

  setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        window.location.reload()
      }, 1500);

}
catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Erro ao salvar dados. Tente novamente.");
    }
  };


  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
    
    <Dialog open={open} onOpenChange={handleOpenChange}> 
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="mb-2">
        <a className="text-lg font-semibold">Complete o cadastro</a>
        <p className="text-sm text-muted-foreground">Adicione informações adicionais para ter acesso total</p>
        </DialogTitle>
          
        <div className="space-y-2">
        <Label>Nome completo</Label>
        <Input    
          placeholder="Digite seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        </div>  

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label>Celular</Label>
          <PatternFormat
            format="(##) #####-####"
            mask="_"
            customInput={Input}
            value={phone}
            onValueChange={(values) => setPhone(values.value)}
            placeholder="(00) 00000-0000"
          />
          </div>


          <div className="space-y-2">
          <Label>Confirme o celular</Label>
          <PatternFormat
            format="(##) #####-####"
            mask="_"
            customInput={Input}
            placeholder="(00) 00000-0000"
          />
          </div>
        </div>

        <div className="space-y-2">
        <Label>Data de Nascimento</Label>
        <PatternFormat
    format="##/##/####"
    mask="_"
    customInput={Input}
    value={nascimento}
    onValueChange={(values) => setNascimento(values.value)} // Salva apenas os números (ex: 01100019922)
    placeholder="DD/MM/AAAA"
  />
        </div>


        {/* CPF */}
        <div className="space-y-2">
        <Label>CPF</Label>
        <PatternFormat
          format="###.###.###-##"
          mask="_"
          customInput={Input}
          value={cpf}
          onValueChange={(values) => setCpf(values.value)} // Salva apenas os números (ex: 01100019922)
          placeholder="000.000.000-00"
        />
        </div>

        <div className="flex items-start gap-2">
        <Checkbox
        id="terms"/>
        <a className="text-muted-foreground">
        Ao realizar este pagamento e confirmar minha compra desse título de capitalização, declaro ter lido e concordado com os termos desta anexados na página do sorteio.

        </a>
        </div>

        <Button 
    className="w-full" 
    onClick={send} 
    disabled={status === "loading" || status === "success"}
  >
    {status === "loading" ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : status === "success" ? (
      <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
    ) : status === "error" ? (
      <AlertCircle className="mr-2 h-4 w-4 text-red-400" />
    ) : (
      <ExternalLink className="mr-2 h-4 w-4" />
    )}

    {status === "loading" ? "Salvando..." : 
     status === "success" ? "Concluído!" : 
     status === "error" ? "Tentar novamente" : 
     "Concluir cadastro"}
  </Button>

  {errorMessage && <p className="text-xs text-red-500 mt-2 text-center">{errorMessage}</p>}

      </DialogContent>
    </Dialog>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none">
            <img src={user.photoURL ?? ""} className="h-8 w-8 rounded-full cursor-pointer" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">

        <DropdownMenuLabel className="text-sm font-bold">
          {user.displayName || "Usuário"}
        </DropdownMenuLabel>

        <DropdownMenuSeparator /> 

        {!hasProfile && (
          <>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <FileText className="mr-2 h-4 w-4"/>
              Completar cadastro
            </DropdownMenuItem>
          </>
        )}

        {hasProfile && (
          <>
          <DropdownMenuItem onClick={() => router.push("/configs")}>
            <Settings className="mr-2 h-4 w-4"/>
            Configurações
          </DropdownMenuItem>
        
          <DropdownMenuItem onClick={() => router.push("/payments")}>
            <Wallet className="mr-2 h-4 w-4"/>
            Transações
          </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>

    </>
  );
}

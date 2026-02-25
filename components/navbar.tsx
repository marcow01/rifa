"use client";

import {
  Headset,
  UserRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { z } from "zod";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { PatternFormat } from "react-number-format";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AvatarMenu from "@/components/avatar";

export default function Navbar() {
  const { user } = useUser();

  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("register");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const profileSchema = z.object({
    name: z.string().min(5, "Nome muito curto"),
    phone: z.string().min(10, "Telefone inválido"),
    cpf: z.string().refine((val) => cpfValidator.isValid(val), {
      message: "CPF inválido",
    }),
    nascimento: z.string().min(8, "Data inválida"),
  });

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Preencha email e senha.");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");

      await signInWithEmailAndPassword(auth, email, password);

      setStatus("success");

      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1000);
    } catch {
      setStatus("error");
      setErrorMessage("Email ou senha inválidos.");
    }
  };

  function isAdult(dateString: string) {
  if (!dateString) return false;

  const [day, month, year] = dateString.split("/").map(Number);

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

  // ================= CADASTRO =================
  const handleRegister = async () => {

    setStatus("idle");
    setErrorMessage("");

    const result = profileSchema.safeParse({
      name,
      phone,
      cpf,
      nascimento,
    });

    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    if (!email || !password) {
      setErrorMessage("Preencha email e senha.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage("Você precisa aceitar os termos.");
      return;
    }

    if (!isAdult(nascimento)) {
      setErrorMessage("Você precisa ter no mínimo 18 anos.");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        name,
        phone,
        cpf,
        nascimento,
        email: newUser.email,
        gastos: 0,
        compras: [],
        createdAt: new Date(),
      });

      setStatus("success");

      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1500);
    } catch (err: any) {
      setStatus("error");

      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("Esse email já está em uso.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Senha muito fraca.");
      } else {
        setErrorMessage("Erro ao criar conta.");
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-primary text-secondary">
        <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-xl font-semibold tracking-tight"
            >
              1 CENTAVO 1000 NO PIX HOJE!
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* SUPORTE */}
            <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Headset className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Suporte</DialogTitle>
                <p>Fale com nosso suporte via WhatsApp.</p>
              </DialogContent>
            </Dialog>

            {/* LOGIN / AVATAR */}
            {!user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
              >
                <UserRound className="h-5 w-5" />
              </Button>
            ) : (
              <AvatarMenu />
            )}
          </div>
        </nav>
      </header>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
          {/* Toggle Login/Register */}
          
          <div className="flex mb-4 bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm rounded-md transition ${
                mode === "login"
                  ? "bg-primary shadow font-semibold text-secondary"
                  : "text-muted-foreground"
              }`}
            >
              Fazer login
            </button>

            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm rounded-md transition ${
                mode === "register"
                  ? "bg-primary shadow font-semibold text-secondary"
                  : "text-muted-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          <DialogTitle className="mb-4">
            {mode === "login" ? "Entrar na conta" : "Criar conta"}
          </DialogTitle>

          <div className="space-y-4 overflow-y-auto pr-2">
            {/* EMAIL + SENHA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <Label className="mb-2">Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            {/* CAMPOS EXTRAS SOMENTE NO CADASTRO */}
            {mode === "register" && (
              <>
                <div>
                  <Label className="mb-2">Nome completo</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <Label className="mb-2">Celular</Label>
                  <PatternFormat
                    format="(##) #####-####"
                    customInput={Input}
                    value={phone}
                    onValueChange={(values) => setPhone(values.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label className="mb-2">Data de Nascimento</Label>
                  <PatternFormat
                    format="##/##/####"
                    customInput={Input}
                    value={nascimento}
                    onValueChange={(values) => setNascimento(values.value)}
                    placeholder="DD/MM/AAAA"
                  />
                </div>

                <div>
                  <Label className="mb-2">CPF</Label>
                  <PatternFormat
                    format="###.###.###-##"
                    customInput={Input}
                    value={cpf}
                    onValueChange={(values) => setCpf(values.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ao realizar este cadastro, concordo com os termos.
                  </p>
                </div>
              </>
            )}

            {/* BOTÃO */}
            <Button
              className="w-full"
              onClick={mode === "login" ? handleLogin : handleRegister}
              disabled={status === "loading"}
            >
              {status === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {status === "success"
                ? "Sucesso!"
                : mode === "login"
                ? "Entrar"
                : "Criar conta"}
            </Button>

            {errorMessage && (
              <p className="text-xs text-red-700 text-center">
                {errorMessage}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
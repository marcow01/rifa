"use client"

import { useEffect, useRef, useState } from "react"
import { Progress } from "@/components/ui/progress"

type Props = {
  dueDate: string
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function PixTimer({ dueDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const totalMsRef = useRef<number | null>(null)

useEffect(() => {
    // IGNORAMOS a data da API para evitar erro de fuso/formato 12h/24h.
    // Usamos o 'agora' do computador do usuário.
    const startTime = Date.now();
    const target = startTime + (3000 * 1000); // 50 minutos cravados

    const updateTime = () => {
      const now = Date.now();
      const remaining = target - now;

      if (totalMsRef.current === null) {
        totalMsRef.current = 3000 * 1000;
      }

      setTimeLeft(remaining);
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
}, [dueDate]); // Mantemos o dueDate aqui para que, se gerar um novo Pix, o timer resete

  if (timeLeft === null) return null

  if (timeLeft <= 0) {
    return <p className="font-medium">Tempo de pagamento esgotado!</p>
  }

  const totalMs = totalMsRef.current ?? (3000 * 1000)
  // Inverti a lógica da barra para ela esvaziar conforme o tempo passa (opcional)
  const progresstimer = Math.max(0, Math.min(100, (timeLeft / totalMs) * 100))

  return (
    <div className="space-y-2">
      <p className="flex justify-center gap-2 mt-10 items-center text-sm md:text-sm font-extrabold tracking-tight text-muted-foreground leading-tight text-center">
      
        Você tem{" "}
        <span className="ap-2 items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-extrabold tracking-tight text-primary leading-tight">
          {formatTime(timeLeft)}
        </span>{" "}
        para pagar!
      </p>

      <Progress value={progresstimer} className="h-2" />
    </div>
  )
}

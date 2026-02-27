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
  const totalMsRef = useRef<number>(15 * 60 * 1000)

  useEffect(() => {
    const STORAGE_KEY = "pix_expiration_time"

    let target = localStorage.getItem(STORAGE_KEY)

    // 🔥 Se não existir, cria um novo timer de 15 minutos
    if (!target) {
      const newTarget = Date.now() + (15 * 60 * 1000)
      localStorage.setItem(STORAGE_KEY, String(newTarget))
      target = String(newTarget)
    }

    const targetTime = Number(target)

    const updateTime = () => {
      const now = Date.now()
      const remaining = targetTime - now
      setTimeLeft(remaining)
    }

    updateTime()

    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)

  }, [dueDate])

  if (timeLeft === null) return null

  if (timeLeft <= 0) {
    localStorage.removeItem("pix_expiration_time")
    return <p className=""></p>
  }

  const progress = Math.max(
    0,
    Math.min(100, (timeLeft / totalMsRef.current) * 100)
  )

  return (
    <div>
      <p className="flex justify-center gap-2 items-center text-sm font-medium tracking-tight text-muted-foreground text-center">
        Você tem{" "}
        <span className="text-2xl font-extrabold text-primary">
          {formatTime(timeLeft)}
        </span>{" "}
        para aproveitar a promoção de fichas!
      </p>

      <Progress value={progress} className="h-2 mt-2" />
    </div>
  )
}
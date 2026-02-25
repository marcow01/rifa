"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Page() {

  const [currentStep, setCurrentStep] = useState(1);
   const router = useRouter();

  const handleVideoEnd = () => {
    // Quando o vídeo acaba, passa para o próximo passo
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Cabeçalho Dinâmico */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
            {currentStep === 1 ? "vídeo 1" : ""}
            {currentStep === 2 ? "vídeo 2" : ""}
            {currentStep === 3 ? "vídeo 3" : ""}
          </h1>
        </div>

        {/* Container do Vídeo */}
        <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
          {currentStep === 1 && (
            <video
              src="/video1.mp4"
              controls
              autoPlay
              className="w-full h-full"
              onEnded={handleVideoEnd}
            />
          )}

          {currentStep === 2 && (
            <video
              src="/video2.mp4"
              controls
              autoPlay
              className="w-full h-full"
              onEnded={handleVideoEnd}
            />
          )}

          {currentStep === 3 && (
            <video
              src="/video3.mp4"
              controls
              autoPlay
              className="w-full h-full"
            />
          )}
        </div>

        <div className="flex justify-center gap-4">

            {currentStep === 3 && <>
            
            <Button className="flex-1" onClick={() => router.push("/")}>Comprar fichas</Button>

          </>}

          <div className="flex items-center gap-2">
            <button onClick={() => {setCurrentStep(1)}} className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-sm font-bold ${currentStep === 1 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'}`}>
              1
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div onClick={() => {setCurrentStep(2)}} className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-sm font-bold ${currentStep === 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div onClick={() => {setCurrentStep(3)}} className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-sm font-bold ${currentStep === 3 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
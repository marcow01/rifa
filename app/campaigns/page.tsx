"use client"

import  Navbar from "@/components/navbar";

export default function Page() {

  return (

    <>
    
    <Navbar></Navbar>

        <main className="py-2">
        <div className="mx-auto w-full max-w-2xl px-4">
            
            <a href="" className="text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-extrabold tracking-tight text-primary leading-tight">Campanhas</a>
        <p className="mt-2 text-sm md:text-sm mb-2 text-muted-foreground font-medium">Campanhas Ativas: Aqui você visualiza as campanhas disponíveis no momento. No momento, apenas a campanha atual está ativa. Fique atento às atualizações para não perder novas oportunidades. Garanta sua participação dentro do período válido para concorrer normalmente.</p>

        </div>
        </main>

    </>
    
  )
}

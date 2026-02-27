"use client"

import  Navbar from "@/components/navbar";

export default function Page() {

  return (

    <>
    
    <Navbar></Navbar>
    <main className="py-2">
        <div className="mx-auto w-full max-w-2xl px-4">
            <a href="" className="text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-extrabold tracking-tight text-primary leading-tight">Comunicados</a>
        <p className="mt-2 text-sm md:text-sm mb-2 text-muted-foreground font-medium">Comunicados: Este é o espaço onde publicamos avisos importantes, atualizações e informações relevantes sobre a plataforma e as campanhas. No momento, não há nenhum comunicado disponível. Fique atento para futuras atualizações.</p>

        </div>
        </main>
    </>
    
  )
}

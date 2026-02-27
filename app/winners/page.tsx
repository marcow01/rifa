"use client"

import  Navbar from "@/components/navbar";

export default function Page() {

  return (

    <>
    
    <Navbar></Navbar>
    <main className="py-2">
        <div className="mx-auto w-full max-w-2xl px-4">
                        <a href="" className="text-xl sm:text-2xl md:text-3xl lg:text-3xl  font-extrabold tracking-tight text-primary leading-tight">Ganhadores</a>
        <p className="mt-2 text-sm md:text-sm mb-2 text-muted-foreground font-medium">Ganhadores: Aqui serão divulgados os vencedores de cada ação realizada. Como esta é a primeira ação, ainda não há ganhadores registrados. Assim que o sorteio for concluído, os resultados serão publicados nesta seção.</p>

        </div>
        </main>
    </>
    
  )
}

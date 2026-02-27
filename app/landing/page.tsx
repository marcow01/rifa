"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Page() {
  const router = useRouter();

  const [video, setVideo] = useState(1);
  const [liberarProximo, setLiberarProximo] = useState(false);
  const [liberarUltimo, setLiberarUltimo] = useState(false);
  const [mostrarBotaoFinal, setMostrarBotaoFinal] = useState(false);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega API uma única vez
  useEffect(() => {
    if (window.YT) {
      criarPlayer("Y08_8ZBMDmc");
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      criarPlayer("Y08_8ZBMDmc");
    };
  }, []);

  // Troca de vídeo
  useEffect(() => {
    if (!window.YT) return;

    if (video === 1) criarPlayer("Y08_8ZBMDmc");
    if (video === 2) criarPlayer("Rf8lfUgAlak");
    if (video === 3) criarPlayer("D3Mkr-8edWE");
  }, [video]);

  const criarPlayer = (videoId: string) => {
    // Limpa intervalo antigo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Destroi player antigo
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player("youtube-player", {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onStateChange: (event: any) => {
          // 1 = tocando
          if (event.data === 1) {
            // Só monitorar tempo no vídeo 3
            if (video === 3) {
              intervalRef.current = setInterval(() => {
                const tempoAtual = playerRef.current.getCurrentTime();

                // 🔥 BOTÃO APARECE AOS 18 SEGUNDOS
                if (tempoAtual >= 15) {
                  setMostrarBotaoFinal(true);

                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                }
              }, 400);
            }
          }

          // 0 = terminou
          if (event.data === 0) {
            if (video === 1) setLiberarProximo(true);
            if (video === 2) setLiberarUltimo(true);
          }
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">

      {/* Luzes de fundo */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-500 rounded-full blur-[150px] opacity-30" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500 rounded-full blur-[120px] opacity-20" />

      <main className="w-full max-w-5xl px-4 py-10 relative z-10">

        {/* Título */}
        <div className="text-center space-y-4 mb-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            Dê o{" "}
            <AuroraText
              colors={["#f00505", "#9e0000", "#f16767"]}
              speed={1.2}
            >
              PLAY
            </AuroraText>{" "}
            no vídeo!
          </h1>
        </div>

        {/* Container do player */}
        <div className="relative flex justify-center">
          <div
            className="
              w-full 
              max-w-sm 
              mx-auto
              aspect-[9/16] 
              md:max-w-4xl 
              md:aspect-video
              bg-black 
              rounded-3xl 
              overflow-hidden 
              shadow-2xl
              relative
            "
          >
            <div
              id="youtube-player"
              className="absolute inset-0 w-full h-full rounded-2xl"
            />
          </div>
        </div>

        {/* Botão vídeo 1 */}
        {video === 1 && liberarProximo && (
          <div className="w-full max-w-sm md:max-w-4xl mx-auto mt-4">
            <Button
              className="hover:bg-red-500 w-full flex items-center justify-center gap-2 rounded-xl p-6 bg-red-700"
              onClick={() => {
                setVideo(2);
                setLiberarProximo(false);
              }}
            >
              <ArrowRight className="h-4 w-4 animate-pulse" />
              Próximo vídeo
            </Button>
          </div>
        )}

        {/* Botão vídeo 2 */}
        {video === 2 && liberarUltimo && (
          <div className="w-full max-w-sm md:max-w-4xl mx-auto mt-4">
            <Button
              className="hover:bg-red-500 w-full flex items-center justify-center gap-2 rounded-xl p-6 bg-red-700"
              onClick={() => {
                setVideo(3);
                setLiberarUltimo(false);
              }}
            >
              <ArrowRight className="h-4 w-4 animate-pulse" />
              Último vídeo
            </Button>
          </div>
        )}

        {/* Botão final aos 18s */}
        {video === 3 && mostrarBotaoFinal && (
          <div className="w-full max-w-sm md:max-w-4xl mx-auto mt-6">
            <Button
              className="hover:bg-red-600 w-full flex items-center justify-center gap-2 rounded-xl p-6 bg-red-800 animate-bounce"
              onClick={() => router.push("/")}
            >
              <ArrowRight className="h-4 w-4 animate-pulse" />
              Garanta seus números 🔥
            </Button>
          </div>
        )}

      </main>
    </div>
  );
}
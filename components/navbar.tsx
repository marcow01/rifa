"use client";

import { Headset, Menu, UserRound, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useUser } from "@/lib/user";
import  AvatarMenu  from "@/components/avatar";
import { useState } from "react";

export default function Navbar() {
  const { user, loading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false); 

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

  const handleLogout = async () => {
    await signOut(auth);
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
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-lg font-semibold">
            1 CENTAVO 1000 NO PIX HOJE!
          </Link>
        </div>

        {/* direita */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="transition hover:opacity-80 active:scale-[0.98] cursor-pointer">
            <Headset className="h-5 w-5" />
          </Button>

          {!user && (
            <Button variant="ghost" size="icon" onClick={login} className="cursor-pointer">
              <UserRound className="h-5 w-5" />
            </Button>
          )}

          {user && (
            <>
              <AvatarMenu/>
{/* 
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button> */}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/user";

export function useProfile() {
  const { user, loading } = useUser();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      setHasProfile(snap.exists());
    };

    checkProfile();
  }, [user]);

  return { user, loading, hasProfile };
}

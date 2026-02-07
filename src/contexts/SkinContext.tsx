"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Skin = "default" | "bold" | "retro";

interface SkinContextType {
  skin: Skin;
  setSkin: (skin: Skin) => void;
  retroUnlocked: boolean;
  unlockRetro: () => void;
}

const SkinContext = createContext<SkinContextType>({
  skin: "default",
  setSkin: () => {},
  retroUnlocked: false,
  unlockRetro: () => {},
});

const SKIN_STORAGE_KEY = "birdfeed-skin";
const RETRO_UNLOCK_KEY = "birdfeed-retro-unlocked";

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<Skin>("default");
  const [retroUnlocked, setRetroUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const storedSkin = localStorage.getItem(SKIN_STORAGE_KEY) as Skin | null;
      if (storedSkin && ["default", "bold", "retro"].includes(storedSkin)) {
        setSkinState(storedSkin);
      }
      const unlocked = localStorage.getItem(RETRO_UNLOCK_KEY) === "true";
      setRetroUnlocked(unlocked);
    } catch {
      // localStorage not available
    }
    setMounted(true);
  }, []);

  // Sync data-skin attribute to <html> whenever skin changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-skin", skin);
    }
  }, [skin, mounted]);

  const setSkin = useCallback((newSkin: Skin) => {
    setSkinState(newSkin);
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, newSkin);
    } catch {
      // localStorage not available
    }
    document.documentElement.setAttribute("data-skin", newSkin);
  }, []);

  const unlockRetro = useCallback(() => {
    setRetroUnlocked(true);
    try {
      localStorage.setItem(RETRO_UNLOCK_KEY, "true");
    } catch {
      // localStorage not available
    }
  }, []);

  return (
    <SkinContext.Provider value={{ skin, setSkin, retroUnlocked, unlockRetro }}>
      {children}
    </SkinContext.Provider>
  );
}

export const useSkin = () => useContext(SkinContext);

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Skin = "default" | "bold" | "retro" | "coastal" | "journal" | "meadow" | "highcontrast";

const VALID_SKINS: Skin[] = ["default", "bold", "retro", "coastal", "journal", "meadow", "highcontrast"];

// Migration map: old skin names → new equivalents
const SKIN_MIGRATIONS: Record<string, Skin> = {
  fieldguide: "journal",
};

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
    const loadStoredPreferences = () => {
      try {
        let storedSkin = localStorage.getItem(SKIN_STORAGE_KEY);
        // Migrate deprecated skin names
        if (storedSkin && storedSkin in SKIN_MIGRATIONS) {
          const migrated = SKIN_MIGRATIONS[storedSkin];
          if (migrated) {
            storedSkin = migrated;
            localStorage.setItem(SKIN_STORAGE_KEY, storedSkin);
          }
        }
        if (storedSkin && VALID_SKINS.includes(storedSkin as Skin)) {
          setSkinState(storedSkin as Skin);
        }
        const unlocked = localStorage.getItem(RETRO_UNLOCK_KEY) === "true";
        setRetroUnlocked(unlocked);
      } catch {
        // localStorage not available
      }
      setMounted(true);
    };

    loadStoredPreferences();
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

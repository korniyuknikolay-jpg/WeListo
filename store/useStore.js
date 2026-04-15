import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      userName: "",
      userAvatar: null,
      setProfile: (name, avatar) => set({ userName: name, userAvatar: avatar }),

      language: "ru",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "welisto-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

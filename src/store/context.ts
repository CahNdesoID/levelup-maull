import { createContext, useContext } from "react";
import type { AppStore } from "../hooks/useAppDataState";

/**
 * Kept apart from the provider component so this module exports no components —
 * that keeps react-refresh able to hot-reload the provider cleanly.
 */
export const AppDataContext = createContext<AppStore | null>(null);

export const useStore = (): AppStore => {
  const store = useContext(AppDataContext);
  if (store === null) {
    throw new Error("useStore must be used inside <AppDataProvider>.");
  }
  return store;
};

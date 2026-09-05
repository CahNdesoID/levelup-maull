import type { ReactNode } from "react";
import { AppDataContext } from "./context";
import { useAppDataState } from "../hooks/useAppDataState";

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const store = useAppDataState();
  return <AppDataContext.Provider value={store}>{children}</AppDataContext.Provider>;
};

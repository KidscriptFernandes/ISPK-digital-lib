import { createContext, useContext, useState, ReactNode } from "react";

export type ActiveBook = { id: string; title: string } | null;

interface BookCtx {
  activeBook: ActiveBook;
  setActiveBook: (b: ActiveBook) => void;
}

const Ctx = createContext<BookCtx>({ activeBook: null, setActiveBook: () => {} });

export function BookProvider({ children }: { children: ReactNode }) {
  const [activeBook, setActiveBook] = useState<ActiveBook>(null);
  return <Ctx.Provider value={{ activeBook, setActiveBook }}>{children}</Ctx.Provider>;
}

export const useActiveBook = () => useContext(Ctx);

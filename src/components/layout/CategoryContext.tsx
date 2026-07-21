"use client";

import { createContext, useContext, useState } from "react";

type CategoryContextType = {
  category: string;
  setCategory: (v: string) => void;
};

const CategoryContext = createContext<CategoryContextType>({
  category: "",
  setCategory: () => {},
});

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategory] = useState("");
  return (
    <CategoryContext.Provider value={{ category, setCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  return useContext(CategoryContext);
}

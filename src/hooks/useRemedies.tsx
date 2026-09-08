import { RemedyContext } from "@/contexts/remedyContext";
import { useContext } from "react";

export function useRemedies(){
  const context = useContext(RemedyContext)

  return context
}
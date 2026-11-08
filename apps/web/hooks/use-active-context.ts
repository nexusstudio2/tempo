import { useQuery } from "@tanstack/react-query";
import { getActiveContext } from "@/services/auth.service";

export function useActiveContext() {
  return useQuery({ queryKey: ["contexts", "active"], queryFn: getActiveContext });
}

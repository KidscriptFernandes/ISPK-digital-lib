import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  book_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useThreads() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["chat-threads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_threads")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ChatThread[];
    },
    enabled: !!user,
  });

  async function createThread(bookId?: string | null, id?: string) {
    if (!user) throw new Error("Não autenticado");
    const payload: any = { user_id: user.id, book_id: bookId ?? null };
    if (id) payload.id = id;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["chat-threads"] });
    return data as ChatThread;
  }

  async function deleteThread(id: string) {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["chat-threads"] });
  }

  return {
    threads: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createThread,
    deleteThread,
  };
}

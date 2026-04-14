import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, User, LogOut, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch active loans as notifications
  const { data: loans } = useQuery({
    queryKey: ["my-loans-notif", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("book_loans")
        .select("*, books(title)")
        .eq("user_id", user.id)
        .is("return_date", null)
        .order("due_date", { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch recently added books (last 7 days)
  const { data: newBooks } = useQuery({
    queryKey: ["new-books-notif"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data } = await supabase
        .from("books")
        .select("id, title, author, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const overdueLoans = loans?.filter(
    (l) => new Date(l.due_date) < new Date()
  );
  const newBooksCount = newBooks?.length || 0;
  const hasNotifications = (overdueLoans?.length || 0) > 0 || newBooksCount > 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Biblioteca Virtual
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Notifications */}
                  <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-lg"
                      >
                        <Bell className="h-4 w-4" />
                        {hasNotifications && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                            {(overdueLoans?.length || 0) + newBooksCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="p-3 border-b border-border">
                        <h4 className="font-semibold text-sm">Notificações</h4>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {/* New books section */}
                        {newBooks && newBooks.length > 0 && (
                          <>
                            <div className="px-3 pt-2 pb-1">
                              <p className="text-xs font-semibold text-primary uppercase tracking-wider">📚 Novos Livros</p>
                            </div>
                            {newBooks.map((book) => (
                              <div
                                key={book.id}
                                className="p-3 border-b border-border last:border-0 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => {
                                  setNotifOpen(false);
                                  navigate(`/livro/${book.id}`);
                                }}
                              >
                                <p className="text-sm font-medium truncate">{book.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {book.author} • Adicionado {format(new Date(book.created_at), "dd/MM", { locale: pt })}
                                </p>
                              </div>
                            ))}
                          </>
                        )}

                        {/* Loans section */}
                        {loans && loans.length > 0 && (
                          <>
                            <div className="px-3 pt-2 pb-1">
                              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">📖 Empréstimos Ativos</p>
                            </div>
                            {loans.map((loan) => {
                              const isOverdue = new Date(loan.due_date) < new Date();
                              return (
                                <div
                                  key={loan.id}
                                  className={`p-3 border-b border-border last:border-0 ${isOverdue ? "bg-destructive/10" : ""}`}
                                >
                                  <p className="text-sm font-medium truncate">
                                    {(loan as any).books?.title || "Livro"}
                                  </p>
                                  <p className={`text-xs mt-1 ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                                    {isOverdue ? "⚠️ Atrasado! " : ""}
                                    Devolução: {format(new Date(loan.due_date), "dd/MM/yyyy", { locale: pt })}
                                  </p>
                                </div>
                              );
                            })}
                          </>
                        )}

                        {(!loans || loans.length === 0) && (!newBooks || newBooks.length === 0) && (
                          <div className="p-6 text-center text-sm text-muted-foreground">
                            Sem notificações
                          </div>
                        )}
                      </div>
                      {loans && loans.length > 0 && (
                        <div className="p-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate("/emprestimos");
                            }}
                          >
                            Ver todos os empréstimos
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  {/* Profile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {isAdmin ? "Administrador" : "Estudante"}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/perfil")}>
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/emprestimos")}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Meus Empréstimos
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Settings className="mr-2 h-4 w-4" />
                          Painel Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/">Entrar</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/?mode=register">Cadastrar</Link>
                  </Button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

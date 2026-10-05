import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
<<<<<<< HEAD
import { Search, Trash2, ShieldOff, Users, UserCheck, Ban, Unlock } from "lucide-react";
import { adminCall, type ManagedUser } from "@/lib/adminApi";
import { useAuth } from "@/hooks/useAuth";
=======
import { Search, Trash2, ShieldOff, Users, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<<<<<<< HEAD
type UserRow = ManagedUser;

const AdminUsers = () => {
  const { toast } = useToast();
  const { user: me } = useAuth();
=======
interface UserRow {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  role: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
<<<<<<< HEAD
    try {
      const { users } = await adminCall<{ users: UserRow[] }>({ action: "list_users" });
      setUsers(users);
    } catch (e) {
      toast({ title: "Erro ao carregar utilizadores", description: (e as Error).message, variant: "destructive" });
    }
    setLoading(false);
  }

  async function run(action: string, userId: string) {
    try {
      const r = await adminCall<{ message: string }>({ action, user_id: userId });
      toast({ title: "Sucesso", description: r.message });
      fetchUsers();
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    }
  }

  const filtered = users.filter(u =>
    `${u.full_name || ""} ${u.email || ""}`.toLowerCase().includes(search.toLowerCase())
=======
    const { data: profiles } = await supabase.from("profiles").select("id, user_id, full_name, created_at");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    if (!profiles) { setLoading(false); return; }

    const roleMap: Record<string, string> = {};
    (roles || []).forEach(r => { roleMap[r.user_id] = r.role; });

    const merged: UserRow[] = profiles.map(p => ({
      id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      created_at: p.created_at,
      role: roleMap[p.user_id] || "student",
    }));

    setUsers(merged);
    setLoading(false);
  }

  async function removeUser(userId: string) {
    setLoading(true);

    const { error: rolesError } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (rolesError) {
      toast({
        title: "Erro ao remover papel do usuário",
        description: rolesError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (profileError) {
      toast({
        title: "Erro ao remover perfil do usuário",
        description: profileError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({ title: "Utilizador removido" });
    await fetchUsers();
    setLoading(false);
  }

  const filtered = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase())
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
  );

  const students = users.filter(u => u.role === "student").length;
  const admins = users.filter(u => u.role === "admin").length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-orange-700 to-amber-600 p-7 shadow-xl shadow-secondary/30">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Gestão de Utilizadores</h1>
              <p className="text-white/70 text-sm mt-0.5">Ver e gerir todos os alunos do sistema</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: users.length, color: "text-foreground" },
            { label: "Alunos", value: students, color: "text-secondary" },
            { label: "Administradores", value: admins, color: "text-violet-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
<<<<<<< HEAD
            placeholder="Pesquisar por nome ou email..."
=======
            placeholder="Pesquisar por nome..."
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizador</TableHead>
                    <TableHead className="hidden sm:table-cell">Data de Registo</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                        Nenhum utilizador encontrado
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((u, i) => (
                    <motion.tr
<<<<<<< HEAD
                      key={u.user_id}
=======
                      key={u.id}
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                            {(u.full_name || "?").charAt(0).toUpperCase()}
                          </div>
<<<<<<< HEAD
                          <div>
                            <p className="font-medium text-sm">{u.full_name || <span className="text-muted-foreground italic">Sem nome</span>}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
=======
                          <span className="font-medium text-sm">{u.full_name || <span className="text-muted-foreground italic">Sem nome</span>}</span>
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {u.role === "admin" ? (
                            <><ShieldOff className="h-3 w-3 mr-1" />Admin</>
                          ) : (
                            <><UserCheck className="h-3 w-3 mr-1" />Aluno</>
                          )}
                        </Badge>
<<<<<<< HEAD
                        {u.banned && <Badge variant="destructive" className="text-xs ml-1">Restrito</Badge>}
                        {!u.confirmed && <Badge variant="outline" className="text-xs ml-1">Por confirmar</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.user_id === me?.id ? <span className="text-xs text-muted-foreground pr-3">Você</span> : <>
                        <Button variant="ghost" size="icon" title={u.banned ? "Desbloquear" : "Restringir"} onClick={() => run(u.banned ? "unrestrict_user" : "restrict_user", u.user_id)}>
                          {u.banned ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
=======
                      </TableCell>
                      <TableCell className="text-right">
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover utilizador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é irreversível. O utilizador <strong>{u.full_name}</strong> e todos os seus dados serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
<<<<<<< HEAD
                              <AlertDialogAction onClick={() => run("delete_user", u.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
=======
                              <AlertDialogAction onClick={() => removeUser(u.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
<<<<<<< HEAD
                        </>}
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminUsers;

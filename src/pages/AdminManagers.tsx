import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { ShieldCheck, Plus, Trash2, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminCall, type ManagedUser } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type AdminRow = ManagedUser;

const AdminManagers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const { users } = await adminCall<{ users: AdminRow[] }>({ action: "list_users" });
      setAdmins(users.filter(u => u.role === "admin"));
    } catch (e) {
      toast({ title: "Erro ao carregar administradores", description: (e as Error).message, variant: "destructive" });
    }
    setLoading(false);
  }

  async function createAdmin() {
    if (!email || !name) return;
    setSaving(true);
    try {
      const r = await adminCall<{ message: string }>({
        action: "invite_admin", email, full_name: name,
        redirect_to: `${window.location.origin}/reset-password`,
      });
      toast({ title: "Convite enviado", description: r.message + " O novo administrador deve abrir o email para definir a senha." });
      setEmail(""); setName(""); setDialogOpen(false);
      fetchAdmins();
    } catch (e) {
      toast({ title: "Erro ao criar administrador", description: (e as Error).message, variant: "destructive" });
    }
    setSaving(false);
  }

  async function removeAdmin(userId: string) {
    if (userId === user?.id) {
      toast({ title: "Ação inválida", description: "Não pode remover a sua própria conta de administrador.", variant: "destructive" });
      return;
    }
    try {
      const r = await adminCall<{ message: string }>({ action: "demote_admin", user_id: userId });
      toast({ title: "Privilégios removidos", description: r.message });
      fetchAdmins();
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-purple-900 p-7 shadow-xl shadow-violet-500/30">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Gestão de Administradores</h1>
                <p className="text-white/70 text-sm mt-0.5">Criar e gerir contas com privilégios de administrador</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-violet-700 hover:bg-white/90 gap-2 font-semibold shadow-lg">
                  <Plus className="h-4 w-4" /> Novo Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-violet-600" />
                    Criar Administrador
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do administrador" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ispk.ac.ao" />
                  </div>
                  <p className="text-xs text-muted-foreground">Será enviado um email de convite. O novo administrador define a sua própria senha através do link.</p>
                  <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                    <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                      ⚠ Esta conta terá acesso total ao sistema. Certifique-se de que esta pessoa é de confiança.
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800"
                    onClick={createAdmin}
                    disabled={saving || !email || !name}
                  >
                    {saving ? "A enviar convite..." : "Enviar convite"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{admins.length}</p>
              <p className="text-sm text-muted-foreground">Administradores ativos</p>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrador</TableHead>
                    <TableHead className="hidden sm:table-cell">Desde</TableHead>
                    <TableHead>Nível de Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                        Nenhum administrador encontrado
                      </TableCell>
                    </TableRow>
                  ) : admins.map((admin, i) => (
                    <motion.tr
                      key={admin.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold">
                            {(admin.full_name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{admin.full_name || <span className="italic text-muted-foreground">Sem nome</span>}</p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                            {!admin.last_sign_in_at && <p className="text-xs text-amber-600 font-medium">Convite pendente</p>}
                            {admin.user_id === user?.id && (
                              <p className="text-xs text-violet-600 font-medium">Você</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-0 text-xs gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Controlo Total
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {admin.user_id !== user?.id ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover privilégios de admin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <strong>{admin.full_name}</strong> perderá todos os privilégios de administrador e passará a ser um aluno normal.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeAdmin(admin.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Remover Privilégios
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-muted-foreground pr-3">—</span>
                        )}
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

export default AdminManagers;

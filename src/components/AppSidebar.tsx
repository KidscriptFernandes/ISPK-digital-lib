import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, BookOpen, Library, Search, Settings, LogOut, BookMarked, LogIn, Users, ShieldCheck, TrendingUp, ClipboardList, ImageIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ispkLogo from "@/assets/ispk-logo.jpg";

const publicItems = [
  { title: "Início", url: "/catalogo", icon: BookOpen },
  { title: "Pesquisa", url: "/pesquisa", icon: Search },
];

const authItems = [
  { title: "Início", url: "/inicio", icon: LayoutDashboard },
  { title: "Catálogo", url: "/catalogo", icon: BookOpen },
  { title: "Prateleiras", url: "/prateleiras", icon: Library },
  { title: "Meus Empréstimos", url: "/emprestimos", icon: ClipboardList },
  { title: "Pesquisa", url: "/pesquisa", icon: Search },
];

const adminItems = [
  { title: "Dashboard Admin", url: "/admin", icon: TrendingUp },
  { title: "Gestão de Livros", url: "/admin/livros", icon: BookMarked },
  { title: "Carrossel", url: "/admin/carrossel", icon: ImageIcon },
  { title: "Utilizadores", url: "/admin/utilizadores", icon: Users },
  { title: "Administradores", url: "/admin/administradores", icon: ShieldCheck },
  { title: "Definições", url: "/admin/definicoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const navItems = user ? authItems : publicItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Brand Header */}
      <div className={`flex items-center gap-3 p-4 border-b border-sidebar-border bg-gradient-to-r from-sidebar-background to-sidebar-accent/30`}>
        <div className="relative flex-shrink-0">
          <img src={ispkLogo} alt="ISPK" className="h-10 w-10 rounded-xl object-cover ring-2 ring-sidebar-primary/40" />
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-accent rounded-full border-2 border-sidebar-background" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-sidebar-foreground truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
              ISPK
            </h2>
            <p className="text-xs text-sidebar-foreground/50 truncate">Biblioteca Virtual</p>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-semibold px-4 py-2">
              Navegação
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end
                        activeClassName="bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive ? "" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"}`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-semibold px-4 py-2 mt-2">
                Administração
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5 px-2">
                {adminItems.map((item) => {
                  const isActive = item.url === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink
                          to={item.url}
                          end
                          activeClassName="bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive ? "" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"}`}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <div className="mt-auto p-3 border-t border-sidebar-border">
        {user ? (
          <button
            onClick={signOut}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Terminar Sessão</span>}
          </button>
        ) : (
          <Link
            to="/login"
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary/30 transition-all`}
          >
            <LogIn className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Entrar / Registar</span>}
          </Link>
        )}
      </div>
    </Sidebar>
  );
}

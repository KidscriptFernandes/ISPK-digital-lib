import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { BookProvider } from "@/contexts/BookContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
=======
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import Shelves from "./pages/Shelves";
import BookDetail from "./pages/BookDetail";
import SearchPage from "./pages/SearchPage";
<<<<<<< HEAD
import Assistant from "./pages/Assistant";
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
import AdminBooks from "./pages/AdminBooks";
import AdminSettings from "./pages/AdminSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminManagers from "./pages/AdminManagers";
import AdminCarousel from "./pages/AdminCarousel";
<<<<<<< HEAD
import AdminSubcategories from "./pages/AdminSubcategories";
import MyLoans from "./pages/MyLoans";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <BookProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public landing page */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                {/* Public routes - accessible without login */}
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/pesquisa" element={<SearchPage />} />
                <Route path="/livro/:id" element={<BookDetail />} />
                {/* Protected routes - require login */}
                <Route path="/inicio" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/prateleiras" element={<ProtectedRoute><Shelves /></ProtectedRoute>} />
                <Route path="/emprestimos" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/assistente" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
                <Route path="/assistente/:threadId" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
                {/* Admin-only routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/livros" element={<ProtectedRoute adminOnly><AdminBooks /></ProtectedRoute>} />
                <Route path="/admin/utilizadores" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/administradores" element={<ProtectedRoute adminOnly><AdminManagers /></ProtectedRoute>} />
                <Route path="/admin/carrossel" element={<ProtectedRoute adminOnly><AdminCarousel /></ProtectedRoute>} />
                <Route path="/admin/subcategorias" element={<ProtectedRoute adminOnly><AdminSubcategories /></ProtectedRoute>} />
                <Route path="/admin/definicoes" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AssistantLauncher />
            </BrowserRouter>
          </TooltipProvider>
        </BookProvider>
      </AuthProvider>
    </ThemeProvider>
=======
import AdminLoans from "./pages/AdminLoans";
import MyLoans from "./pages/MyLoans";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ChatBotFloating from "./components/ChatBotFloating";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Public routes - accessible without login */}
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/pesquisa" element={<SearchPage />} />
            <Route path="/livro/:id" element={<BookDetail />} />
            {/* Protected routes - require login */}
            <Route path="/inicio" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/prateleiras" element={<ProtectedRoute><Shelves /></ProtectedRoute>} />
            <Route path="/emprestimos" element={<ProtectedRoute><MyLoans /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* Admin-only routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/livros" element={<ProtectedRoute adminOnly><AdminBooks /></ProtectedRoute>} />
            <Route path="/admin/emprestimos" element={<ProtectedRoute adminOnly><AdminLoans /></ProtectedRoute>} />
            <Route path="/admin/utilizadores" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/administradores" element={<ProtectedRoute adminOnly><AdminManagers /></ProtectedRoute>} />
            <Route path="/admin/carrossel" element={<ProtectedRoute adminOnly><AdminCarousel /></ProtectedRoute>} />
            <Route path="/admin/definicoes" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBotFloating />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
  </QueryClientProvider>
);

export default App;
<<<<<<< HEAD

=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de

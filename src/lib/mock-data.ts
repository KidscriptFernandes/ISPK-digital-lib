export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  category: string;
  categoryId: string;
  cover: string;
  description: string;
  pages: number;
  isbn: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  bookCount: number;
  color: string;
}

export const categories: Category[] = [
  { id: "1", name: "Ciências", icon: "Flask", bookCount: 45, color: "hsl(0, 72%, 47%)" },
  { id: "2", name: "Engenharia", icon: "Cog", bookCount: 38, color: "hsl(24, 100%, 45%)" },
  { id: "3", name: "Direito", icon: "Scale", bookCount: 52, color: "hsl(45, 96%, 40%)" },
  { id: "4", name: "Economia", icon: "TrendingUp", bookCount: 33, color: "hsl(0, 72%, 47%)" },
  { id: "5", name: "Informática", icon: "Monitor", bookCount: 61, color: "hsl(24, 100%, 45%)" },
  { id: "6", name: "Medicina", icon: "Heart", bookCount: 29, color: "hsl(0, 72%, 55%)" },
  { id: "7", name: "Educação", icon: "GraduationCap", bookCount: 41, color: "hsl(45, 96%, 40%)" },
  { id: "8", name: "Gestão", icon: "Briefcase", bookCount: 36, color: "hsl(24, 100%, 45%)" },
];

export const books: Book[] = [
  {
    id: "1", title: "Introdução à Programação em Python", author: "Ana Silva",
    year: 2023, category: "Informática", categoryId: "5",
    cover: "https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=300&h=400&fit=crop",
    description: "Um guia completo para iniciantes em programação Python, cobrindo desde os fundamentos até conceitos avançados.",
    pages: 342, isbn: "978-989-123-456-7", available: true,
  },
  {
    id: "2", title: "Fundamentos de Direito Civil Angolano", author: "José Mendes",
    year: 2022, category: "Direito", categoryId: "3",
    cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=400&fit=crop",
    description: "Análise aprofundada dos princípios do direito civil no contexto jurídico angolano.",
    pages: 518, isbn: "978-989-234-567-8", available: true,
  },
  {
    id: "3", title: "Economia de Mercados Emergentes", author: "Maria Santos",
    year: 2024, category: "Economia", categoryId: "4",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop",
    description: "Estudo sobre as dinâmicas económicas dos mercados emergentes africanos.",
    pages: 289, isbn: "978-989-345-678-9", available: false,
  },
  {
    id: "4", title: "Engenharia de Software Moderna", author: "Carlos Fernandes",
    year: 2023, category: "Engenharia", categoryId: "2",
    cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=400&fit=crop",
    description: "Metodologias ágeis e práticas modernas de desenvolvimento de software.",
    pages: 456, isbn: "978-989-456-789-0", available: true,
  },
  {
    id: "5", title: "Biologia Celular e Molecular", author: "Teresa Lopes",
    year: 2021, category: "Ciências", categoryId: "1",
    cover: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=400&fit=crop",
    description: "Manual abrangente sobre estruturas celulares e processos moleculares.",
    pages: 612, isbn: "978-989-567-890-1", available: true,
  },
  {
    id: "6", title: "Gestão de Projectos", author: "Paulo Oliveira",
    year: 2024, category: "Gestão", categoryId: "8",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=400&fit=crop",
    description: "Técnicas e ferramentas para gestão eficaz de projectos empresariais.",
    pages: 298, isbn: "978-989-678-901-2", available: true,
  },
  {
    id: "7", title: "Anatomia Humana Essencial", author: "Luísa Tavares",
    year: 2022, category: "Medicina", categoryId: "6",
    cover: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=400&fit=crop",
    description: "Guia visual completo de anatomia humana para estudantes de medicina.",
    pages: 724, isbn: "978-989-789-012-3", available: true,
  },
  {
    id: "8", title: "Pedagogia e Didáctica", author: "Fernando Costa",
    year: 2023, category: "Educação", categoryId: "7",
    cover: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=400&fit=crop",
    description: "Métodos pedagógicos inovadores para o ensino superior em Angola.",
    pages: 356, isbn: "978-989-890-123-4", available: true,
  },
];

export const stats = {
  totalBooks: 335,
  totalCategories: 8,
  activeLoans: 47,
  newThisMonth: 12,
};

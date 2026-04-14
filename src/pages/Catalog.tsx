import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Search, Grid3X3, List, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("cat") || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [booksRes, catsRes] = await Promise.all([
        supabase.from("books").select("*, categories(name)").order("title"),
        supabase.from("categories").select("*").order("name"),
      ]);
      setBooks(booksRes.data || []);
      setCategories(catsRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = books.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || b.category_id === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} livros encontrados</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por título ou autor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}><Grid3X3 className="h-4 w-4" /></Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((book) => (
              <motion.div key={book.id} variants={item}>
                <Link to={`/livro/${book.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                    {book.cover_image_url && (
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <p className="font-medium text-foreground text-sm line-clamp-1">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author} · {book.publication_year}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{book.categories?.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((book) => (
              <motion.div key={book.id} variants={item}>
                <Link to={`/livro/${book.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex gap-4">
                      {book.cover_image_url && <img src={book.cover_image_url} alt={book.title} className="w-16 h-20 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{book.title}</p>
                        <p className="text-sm text-muted-foreground">{book.author} · {book.publication_year}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{book.description}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{book.categories?.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Catalog;

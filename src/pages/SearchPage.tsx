import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [booksRes, catsRes] = await Promise.all([
        supabase.from("books").select("*, categories(name)").order("title"),
        supabase.from("categories").select("*").order("name"),
      ]);
      setAllBooks(booksRes.data || []);
      setResults(booksRes.data || []);
      setCategories(catsRes.data || []);
    }
    load();
  }, []);

  const handleSearch = () => {
    const filtered = allBooks.filter((b) => {
      const matchQuery = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "all" || b.category_id === category;
      const matchYear = (!yearFrom || (b.publication_year && b.publication_year >= parseInt(yearFrom))) && (!yearTo || (b.publication_year && b.publication_year <= parseInt(yearTo)));
      return matchQuery && matchCat && matchYear;
    });
    setResults(filtered);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pesquisa Avançada</h1>
          <p className="text-muted-foreground mt-1">Encontre o livro ideal</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filtros</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Título ou autor..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Ano de" type="number" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
              <Input placeholder="Ano até" type="number" value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
            </div>
            <Button onClick={handleSearch} className="gap-2"><SearchIcon className="h-4 w-4" /> Pesquisar</Button>
          </CardContent>
        </Card>

        <div>
          <p className="text-sm text-muted-foreground mb-3">{results.length} resultado(s)</p>
          <div className="space-y-3">
            {results.map((book) => (
              <Link key={book.id} to={`/livro/${book.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex gap-4">
                    {book.cover_image_url && <img src={book.cover_image_url} alt={book.title} className="w-14 h-18 object-cover rounded" />}
                    <div>
                      <p className="font-medium text-foreground">{book.title}</p>
                      <p className="text-sm text-muted-foreground">{book.author} · {book.publication_year} · {book.categories?.name}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SearchPage;

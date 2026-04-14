import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, Plus, GripVertical, Image, Save, X } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  sort_order: number;
  active: boolean;
}

export default function AdminCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) setSlides(data);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleUpload = async () => {
    if (!newFile) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = newFile.name.split(".").pop();
      const fileName = `carousel/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("books")
        .upload(fileName, newFile, { contentType: newFile.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("books").getPublicUrl(fileName);

      const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.sort_order)) : -1;

      const { error: insertError } = await supabase.from("carousel_slides").insert({
        image_url: urlData.publicUrl,
        title: newTitle || null,
        subtitle: newSubtitle || null,
        sort_order: maxOrder + 1,
      });
      if (insertError) throw insertError;

      toast({ title: "Slide adicionado com sucesso!" });
      setNewTitle("");
      setNewSubtitle("");
      setNewFile(null);
      const fileInput = document.getElementById("carousel-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchSlides();
    } catch (err: any) {
      toast({ title: "Erro ao adicionar slide", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("carousel_slides").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slide removido" });
      fetchSlides();
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from("carousel_slides").update({ active }).eq("id", id);
    fetchSlides();
  };

  const startEdit = (slide: Slide) => {
    setEditingId(slide.id);
    setEditTitle(slide.title || "");
    setEditSubtitle(slide.subtitle || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("carousel_slides").update({
      title: editTitle || null,
      subtitle: editSubtitle || null,
    }).eq("id", editingId);
    if (error) {
      toast({ title: "Erro ao guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slide atualizado!" });
      setEditingId(null);
      fetchSlides();
    }
  };

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const idx = slides.findIndex(s => s.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === slides.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const updates = [
      supabase.from("carousel_slides").update({ sort_order: slides[swapIdx].sort_order }).eq("id", slides[idx].id),
      supabase.from("carousel_slides").update({ sort_order: slides[idx].sort_order }).eq("id", slides[swapIdx].id),
    ];
    await Promise.all(updates);
    fetchSlides();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão do Carrossel</h1>
          <p className="text-muted-foreground text-sm">Adicione, edite ou remova imagens do carrossel da página inicial.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Adicionar Novo Slide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="carousel-file">Imagem *</Label>
              <Input
                id="carousel-file"
                type="file"
                accept="image/*"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Título (opcional)</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Biblioteca Moderna"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtítulo (opcional)</Label>
                <Input
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Ex: Espaço de estudo"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleUpload} disabled={uploading || !newFile}>
              {uploading ? "A enviar..." : "Adicionar Slide"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Slides Atuais ({slides.length})</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">A carregar...</p>
          ) : slides.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Nenhum slide adicionado. As imagens padrão serão exibidas.</p>
              </CardContent>
            </Card>
          ) : (
            slides.map((slide, idx) => (
              <Card key={slide.id} className={`${!slide.active ? "opacity-60" : ""}`}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSlide(slide.id, "up")}
                      disabled={idx === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                    >▲</button>
                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                    <button
                      onClick={() => moveSlide(slide.id, "down")}
                      disabled={idx === slides.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                    >▼</button>
                  </div>

                  <img
                    src={slide.image_url}
                    alt={slide.title || "Slide"}
                    className="h-20 w-32 object-cover rounded-lg border border-border flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    {editingId === slide.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Título"
                          className="h-8 text-sm"
                        />
                        <Input
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          placeholder="Subtítulo"
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="h-3 w-3 mr-1" />Guardar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-3 w-3 mr-1" />Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-foreground truncate">{slide.title || "Sem título"}</p>
                        <p className="text-xs text-muted-foreground truncate">{slide.subtitle || "Sem subtítulo"}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">Posição: {idx + 1}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={slide.active}
                      onCheckedChange={(v) => handleToggleActive(slide.id, v)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => startEdit(slide)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(slide.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

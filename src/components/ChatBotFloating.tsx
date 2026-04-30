import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import ispkLogo from "@/assets/ispk-logo.jpg";

const defaults = [
  {
    role: "bot",
    text: "Olá! Sou a Kate, assistente bibliotecária do ISPK. Pergunte sobre livros, busca, empréstimos ou o acervo e eu te ajudo.",
  },
];

const createReply = (message: string) => {
  const text = message.toLowerCase();

  if (/(ler online|leitura online|visualizar pdf|ler o livro|ver online)/.test(text)) {
    return "Para ler online, abra a página do livro e clique no botão 'Ler Online'. O PDF será exibido na própria página para você navegar sem sair do site.";
  }

  if (/(download|baixar|salvar|guardar|pdf)/.test(text)) {
    return "Se o livro tem versão digital, use o botão 'Download' na página do livro. Ele fará o download automático do PDF para o seu computador.";
  }

  if (/(autor|quem escreveu|escritor|autores)/.test(text)) {
    return "Procure pelo nome do autor no campo de busca ou abra um livro para ver o autor na ficha. No ISPK, os autores ajudam a encontrar obras relacionadas pela mesma área.";
  }

  if (/(categoria|gênero|assunto|disciplina|área)/.test(text)) {
    return "Use as prateleiras e os filtros do catálogo para encontrar livros por tema, curso ou disciplina. Isso facilita buscar materiais específicos para o seu trabalho.";
  }

  if (/(disponível|emprestado|disponibilidade)/.test(text)) {
    return "Na página do livro, a disponibilidade indica se o exemplar físico ainda pode ser retirado. Se estiver emprestado, você pode escolher outro título ou aguardar a devolução.";
  }

  if (/(reserva|solicitação|empréstimo|emprestimo)/.test(text)) {
    return "Para solicitar um empréstimo, faça login e clique no botão correspondente na página do livro. O administrador validará a solicitação e realizará a reserva do exemplar físico.";
  }

  if (/(faq|perguntas frequentes|duvidas|dúvidas)/.test(text)) {
    return `Perguntas frequentes do ISPK:

1. Como buscar livros? Use título, autor ou palavra-chave na busca.
2. Como ler online? Abra o livro e clique em 'Ler Online'.
3. Como baixar? Use o botão 'Download' se estiver disponível.
4. Como solicitar empréstimo? Faça login e clique em 'Solicitar Empréstimo'.
5. Como renovar? Verifique seu painel de empréstimos após login.`;
  }

  const genericAnswers = [
    "Sou a assistente bibliotecária do ISPK. Pergunte sobre livros, busca, disponibilidade ou leitura online.",
    "Posso ajudar a encontrar livros por tema, autor ou categoria e orientar como usar o catálogo do ISPK.",
    "Meu foco é apoiar sua pesquisa e leitura no acervo do ISPK. Pergunte sobre qualquer livro ou processo de busca.",
  ];

  return genericAnswers[Math.floor(Math.random() * genericAnswers.length)];
};

const ChatBotFloating = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(defaults);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage = { role: "user", text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const botText = createReply(trimmed);

    setTimeout(() => {
      setMessages((current) => [...current, { role: "bot", text: botText }]);
      setIsTyping(false);
    }, 250);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-5 right-5 z-50 flex items-end justify-end">
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="h-16 w-16 rounded-full p-0 shadow-xl shadow-black/20 bg-gradient-to-br from-primary to-secondary border-none"
            aria-label="Abrir chat ISPK"
          >
            <img src={ispkLogo} alt="ISPK" className="h-full w-full rounded-full object-cover" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="w-[92vw] max-w-md p-0 overflow-hidden bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/10">
          <div className="flex items-center gap-3">
            <img src={ispkLogo} alt="ISPK" className="h-10 w-10 rounded-xl object-cover border border-primary/40" />
            <div>
              <h2 className="text-base font-semibold">Kate</h2>
              <p className="text-xs text-muted-foreground">Chatbot do ISPK para ajudar com livros e pesquisa.</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[60vh] flex-col bg-background">
          <div ref={chatListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl p-3 ${message.role === "bot" ? "bg-muted/80 text-foreground self-start" : "bg-primary/10 text-foreground self-end"}`}
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">{message.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="rounded-2xl p-3 bg-muted/80 text-foreground self-start">
                <p className="text-sm leading-6">Kate está digitando...</p>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4 bg-card">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre livros, catálogo ou recursos do ISPK..."
                className="min-h-[64px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button size="icon" className="h-14 w-14 rounded-2xl" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBotFloating;


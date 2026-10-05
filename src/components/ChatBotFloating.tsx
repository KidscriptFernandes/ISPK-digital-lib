import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import ispkLogo from "@/assets/ispk-logo.jpg";

const defaults = [
  {
    role: "bot",
    text: "Olá! Sou a Kate, assistente bibliotecária do ISPK. Pergunte sobre livros, busca, empréstimos ou o acervo e eu te ajudo.",
  },
];

const createReply = (message: string) => {
  const text = message.toLowerCase();

  if (/(ola|olá|oi|bom dia|boa tarde|boa noite)/.test(text)) {
    return "Olá 👋 Bem-vindo à Biblioteca Virtual do ISPK. Posso ajudar você a encontrar livros, autores, categorias, downloads, leitura online, empréstimos e muito mais.";
  }

  if (/(ler online|leitura online|visualizar pdf|ler o livro|ver online)/.test(text)) {
    return "Para ler online, abra a página do livro e clique no botão 'Ler Online'. O PDF será exibido diretamente na plataforma para leitura rápida e prática sem precisar baixar.";
  }

  if (/(download|baixar|salvar|guardar|pdf)/.test(text)) {
    return "Se o livro possui versão digital, utilize o botão 'Download'. O sistema iniciará automaticamente o download do PDF para o seu dispositivo.";
  }

  if (/(autor|quem escreveu|escritor|autores)/.test(text)) {
    return "Você pode pesquisar pelo nome do autor usando a barra de busca. Na ficha de cada livro também é possível visualizar o autor, obras relacionadas e outras publicações da mesma área.";
  }

  if (/(categoria|gênero|assunto|disciplina|área|curso)/.test(text)) {
    return "Use as categorias e filtros do catálogo para encontrar livros por curso, disciplina, tema ou área científica. Isso facilita localizar materiais específicos para estudos e pesquisas.";
  }

  if (/(disponível|emprestado|disponibilidade)/.test(text)) {
    return "Na página do livro, a disponibilidade mostra se o exemplar físico está livre para empréstimo. Caso esteja emprestado, você poderá aguardar a devolução ou procurar outro exemplar.";
  }

  if (/(reserva|solicitação|empréstimo|emprestimo)/.test(text)) {
    return "Para solicitar um empréstimo, faça login na plataforma e clique em 'Solicitar Empréstimo'. O administrador analisará sua solicitação e confirmará a reserva do livro físico.";
  }

  if (/(renovar|renovação|prorrogar)/.test(text)) {
    return "Os empréstimos podem ser renovados no painel do usuário após login. Verifique se o livro não possui reservas pendentes antes de solicitar a renovação.";
  }

  if (/(login|entrar|acesso|conta)/.test(text)) {
    return "Para acessar sua conta, clique em 'Entrar' e utilize suas credenciais acadêmicas. Após o login, você poderá solicitar empréstimos, renovar livros e acompanhar seu histórico.";
  }

  if (/(cadastro|registrar|criar conta)/.test(text)) {
    return "O cadastro é realizado pela administração do ISPK. Caso ainda não tenha acesso, entre em contato com a secretaria ou com o administrador da biblioteca.";
  }

  if (/(pesquisar|buscar|procurar livro|encontrar livro)/.test(text)) {
    return "Você pode pesquisar livros pelo título, autor, categoria, palavra-chave ou área de estudo usando a barra de pesquisa principal.";
  }

  if (/(livros novos|novidades|recentes|últimos livros)/.test(text)) {
    return "Na seção de novidades você encontrará os livros recentemente adicionados ao catálogo do ISPK.";
  }

  if (/(biblioteca|acervo|catálogo|catalogo)/.test(text)) {
    return "O catálogo da Biblioteca Virtual do ISPK reúne livros físicos e digitais organizados por categorias, autores e áreas acadêmicas.";
  }

  if (/(horário|horario|funcionamento)/.test(text)) {
    return "O horário de funcionamento da biblioteca pode ser consultado na página principal ou diretamente com a administração do ISPK.";
  }

  if (/(contato|suporte|ajuda|assistência)/.test(text)) {
    return "Caso precise de ajuda adicional, entre em contato com a equipe da biblioteca ou utilize o suporte disponível na plataforma.";
  }

  if (/(multa|penalidade|atraso)/.test(text)) {
    return "Livros devolvidos fora do prazo podem gerar penalidades definidas pela administração da biblioteca. Consulte seu painel para acompanhar seus empréstimos.";
  }

  if (/(ebook|livro digital|digital)/.test(text)) {
    return "Os ebooks disponíveis podem ser lidos online ou baixados em PDF dependendo das permissões do livro.";
  }

  if (/(tcc|monografia|dissertação|artigo científico|artigo cientifico)/.test(text)) {
    return "O ISPK também disponibiliza materiais acadêmicos como TCCs, monografias, dissertações e artigos científicos para consulta e pesquisa.";
  }

  if (/(recomendação|recomendar livro|indicação)/.test(text)) {
    return "Posso ajudar com recomendações de livros por curso, disciplina ou área de interesse. Basta informar o tema desejado.";
  }

  if (/(faq|perguntas frequentes|duvidas|dúvidas)/.test(text)) {
    return `📚 Perguntas Frequentes do ISPK

1. Como buscar livros?
Use título, autor ou palavras-chave na barra de pesquisa.

2. Como ler online?
Abra o livro e clique em 'Ler Online'.

3. Como baixar livros?
Clique em 'Download' se disponível.

4. Como solicitar empréstimo?
Faça login e clique em 'Solicitar Empréstimo'.

5. Como renovar um livro?
Acesse seu painel de usuário após login.

6. Como verificar disponibilidade?
Veja o status do livro na página do exemplar.

7. Existem ebooks?
Sim, alguns livros possuem versão digital em PDF.

8. Posso pesquisar por categoria?
Sim, utilize filtros e categorias do catálogo.

9. Como acessar minha conta?
Clique em 'Entrar' e use suas credenciais.

10. O sistema possui suporte?
Sim, a equipe da biblioteca pode ajudar em caso de dúvidas.`;
  }

  const genericAnswers = [
    "Sou a assistente virtual da Biblioteca do ISPK 📚. Posso ajudar com livros, autores, downloads, leitura online, empréstimos e pesquisas acadêmicas.",
    
    "Posso ajudar você a encontrar livros por tema, categoria, autor ou disciplina e também explicar como utilizar o catálogo do ISPK.",
    
    "Meu objetivo é facilitar sua pesquisa e leitura no acervo do ISPK. Pergunte sobre livros, PDFs, disponibilidade ou empréstimos.",
    
    "Você pode perguntar sobre leitura online, downloads, autores, categorias, renovação de empréstimos e funcionamento da biblioteca.",
    
    "Estou disponível para ajudar estudantes e pesquisadores do ISPK a localizar materiais acadêmicos e utilizar a biblioteca virtual.",
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

      <DialogContent className="w-full h-full md:w-[92vw] md:max-w-md md:h-auto p-0 overflow-hidden bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/10">
          <div className="flex items-center gap-3">
            <img src={ispkLogo} alt="ISPK" className="h-10 w-10 rounded-xl object-cover border border-primary/40" />
            <div>
              <h2 className="text-base font-semibold">Kate</h2>
              <p className="text-xs text-muted-foreground">Chatbot do ISPK para ajudar com livros e pesquisa.</p>
            </div>
          </div>
        </div>

        <div className="flex h-full md:h-[60vh] flex-col bg-background">
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


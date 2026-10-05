Este é um modelo de **README.md** profissional, estruturado e visualmente atraente para o seu projeto de Biblioteca Virtual. Ele destaca a stack técnica moderna que você mencionou e organiza os membros da equipe de forma clara.

---

# 📖 Biblioteca Virtual ISPK (Instituto Superior Politécnico Katangoji)

Bem-vindo ao repositório oficial da **Biblioteca Virtual do ISPK**. Esta plataforma foi desenvolvida para modernizar o acesso ao acervo acadêmico, permitindo que estudantes e docentes consultem, reservem e façam a gestão de recursos literários de forma intuitiva e eficiente.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema de desenvolvimento web para garantir performance, tipagem segura e uma interface de usuário refinada:

* **Framework:** [React.js](https://reactjs.org/) (com Vite)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth e Storage)
* **Ícones:** Lucide React

---

## ✨ Funcionalidades Principais

* **Autenticação Segura:** Login e cadastro de usuários via Supabase Auth.
* **Catálogo Digital:** Visualização de livros, teses e artigos acadêmicos.
* **Pesquisa Avançada:** Filtros por categoria, autor e ano de publicação.
* **Gestão de Reservas:** Sistema para solicitação de empréstimos e devoluções.
* **Painel Administrativo:** Gestão de acervo e usuários para bibliotecários.
* **Design Responsivo:** Adaptado para dispositivos móveis e desktops.

---

## 🛠️ Configuração do Ambiente

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/KidscritFernandes
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_aqui
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 👥 Equipe de Desenvolvimento

Este projeto foi desenvolvido com dedicação pelos seguintes membros:

| Nome | Função |
| :--- | :--- |
| **Filipe Fernandes** | Desenvolvedor Fullstack / Lead |
| **Pétale Afonso** | Designer de UI/UX & Frontend |
| **Avelino Cristina** | Especialista em Banco de Dados (Supabase) |
| **Joaquina Nanga** | Desenvolvedora Frontend |
| **Edjane Raimundo** | Documentação e QA |
| **Damião José** | Desenvolvedor Backend |

---

## 📌 Estrutura de Pastas

```text
src/
├── components/     # Componentes reutilizáveis (shadcn)
├── hooks/          # Hooks personalizados do React
├── lib/            # Configurações de bibliotecas (Supabase client, etc)
├── pages/          # Páginas principais da aplicação
├── types/          # Definições de tipos TypeScript
└── App.tsx         # Componente raiz
```

---

## 📄 Licença

Este projeto é para fins acadêmicos e está sob a licença do **Instituto Superior Politécnico Katangoji (ISPK)**.

---

> **Nota:** Este software foi construído visando a excelência acadêmica e a facilitação do conhecimento dentro do campus.
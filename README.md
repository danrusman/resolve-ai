# 🛡️ Resolve Aí — Plataforma de Gestão de Ocorrências

O Resolve Aí é uma solução Full Stack voltada para o registro, acompanhamento e gestão de ocorrências operacionais e infraestruturais. Desenvolvido para conectar Solicitantes (que relatam problemas) e Gestores (que administram a resolução), o sistema conta com controle de acesso baseado em papéis (RBAC), máquina de estados com histórico auditável e dashboard com métricas em tempo real.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js & Express** — API RESTful em arquitetura modular (ES Modules)
- **MongoDB & Mongoose** — Banco de dados NoSQL e modelagem de dados relacional/auditável
- **JWT (JSON Web Token) & Bcrypt.js** — Autenticação segura e criptografia de senhas
- **Jest & Supertest** — Suíte de testes automatizados de integração e API

### Frontend
- **React 18 com Vite** — SPA de alta performance
- **Tailwind CSS** — Estilização moderna e responsiva
- **Lucide React** — Conjunto de ícones vetoriais

### Infraestrutura & Ferramentas
- **Docker & Docker Compose** — Conteinerização e orquestração completa da aplicação
- **Mongo Express** — Interface administrativa visual para o MongoDB

---

## 📊 Arquitetura e Fluxo do Sistema

O fluxo do sistema é estruturado em dois perfis com permissões específicas:

### 👤 Solicitante
- Registrar conta e autenticar-se na plataforma.
- Criar ocorrências informando título, categoria, localização, descrição e anexo de imagem.
- Acompanhar o andamento de suas solicitações no painel individual.
- Adicionar comentários e consultar a linha do tempo / histórico de alterações.
- Avaliar a resolução de ocorrências concluídas (nota e feedback).

### 👔 Gestor
- Visualizar o Dashboard com contadores e métricas de atendimento em tempo real.
- Listar todas as ocorrências cadastradas no sistema com ordenação e paginação.
- Filtrar ocorrências por status (`ABERTA`, `EM_ANALISE`, `EM_ATENDIMENTO`, `RESOLVIDA`, `CANCELADA`), categoria ou prioridade (`BAIXA`, `MEDIA`, `ALTA`).
- Alterar o status, prioridade e atribuir responsável (gerando registro automático no histórico auditável).
- Adicionar observações, soluções aplicadas e comentários técnicos.

---

## 🔄 Máquina de Estados e Histórico Auditável

Toda alteração no ciclo de vida de uma ocorrência dispara a gravação automática de um registro no modelo de histórico, garantindo rastreabilidade total:

- **Estados Suportados:** `ABERTA` ➔ `EM_ANALISE` ➔ `EM_ATENDIMENTO` ➔ `RESOLVIDA` (ou `CANCELADA` a partir de qualquer etapa anterior).
- **Campos Auditados:** Status anterior, novo status, usuário responsável pela alteração, data/horário e observação técnica.

---

## 🛠️ Como Executar o Projeto

Para localmente, com o Docker e Docker Compose instalados, execute o comando abaixo na raiz do repositório:

``docker-compose up --build``

Endereços dos Serviços:
Frontend (React): http://localhost:5173

Backend (API): http://localhost:3000

Mongo Express (Painel do Banco): http://localhost:8081 (Usuário/Senha: resolve_admin / resolve_password)

MongoDB Database: mongodb://resolve_admin:resolve_password@localhost:27017/resolve_ai_db?authSource=admin

Para remotamente, acesse o site:
https://resolve-ai-fiap.netlify.app/

Para fins de conferência, há dois perfis disponíveis:

| Campo | Perfil de Solicitante | Perfil de Gestor |
| :--- | :--- | :--- |
| **E-mail** | teste@email.com | gestor@email.com |
| **Senha** | 123 | 123 |

### 🧪 Executando os Testes Automatizados
O projeto possui uma suíte de testes de integração cobrindo os fluxos de autenticação, criação de ocorrências e controle de rotas.

Opção 1: Executar via Docker (Recomendado)
Com os containers em execução, rode os testes diretamente dentro do container do backend:\

``docker-compose exec backend npm test ``

Opção 2: Executar Localmente
Na pasta backend, execute:

``cd backend`` <br>
``npm test`` 

### 📌 Principais Endpoints da API

### Autenticação (/api/auth)

|Método|Endpoint|Proteção|Descrição|
| ----------- | ----------- | ----------- | ----------- |
POST|/api/auth/register|Pública|Cadastro de novos usuários (SOLICITANTE ou GESTOR)
POST|/api/auth/login|Pública|Autenticação e geração do Token JWT

### Ocorrências (/api/occurrences)
Método|Endpoint|Proteção|Descrição|
| ----------- | ----------- | ----------- | ----------- |
POST|/api/occurrences|Autenticado|Criar nova ocorrência
GET|/api/occurrences|Autenticado|Listar ocorrências (filtra por criador se for Solicitante)
GET|/api/occurrences/:id|Autenticado|Obter detalhes e histórico auditável da ocorrência
PATCH|/api/occurrences/:id/status|Gestor|"Alterar status| prioridade e responsável
POST|/api/occurrences/:id/comments|Autenticado|Adicionar comentário
PATCH|/api/occurrences/:id/evaluate|Solicitante|Registrar nota e avaliação da resolução

### Dashboard (/api/dashboard)
Método|Endpoint|Proteção|Descrição
| ----------- | ----------- | ----------- | ----------- |
GET|/api/dashboard/metrics|Gestor|Retorna os contadores e métricas agregadas por status

## Serviços utilizados
- Fronte-end: https://app.netlify.com/
- Back-end: https://railway.com/
- Banco de dados: https://cloud.mongodb.com/
# Deploy CardioRisk no EasyPanel

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `Dockerfile` | Build do frontend (React + Nginx) |
| `backend/Dockerfile` | Build do backend (Node.js) |
| `nginx.conf` | Configuração do Nginx para SPA |
| `docker-compose.yml` | Para testes locais |
| `.dockerignore` | Arquivos ignorados no build |

---

## Passo a Passo no EasyPanel

### 1. Criar o Banco de Dados PostgreSQL

1. No EasyPanel, clique em **"Create"** → **"Database"**
2. Escolha **PostgreSQL**
3. Dê um nome: `cardiorisk-db`
4. Clique em **Create**
5. **Anote as credenciais** que serão mostradas:
   - Host (geralmente o nome do serviço)
   - Port (5432)
   - User
   - Password
   - Database name

---

### 2. Criar o Backend (API)

1. Clique em **"Create"** → **"App"**
2. Escolha **"GitHub"** e selecione seu repositório
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `cardiorisk-api` |
| **Branch** | `main` (ou sua branch) |
| **Dockerfile Path** | `backend/Dockerfile` |
| **Port** | `3001` |

4. Em **"Environment Variables"**, adicione:

```
PORT=3001
NODE_ENV=production
DB_HOST=cardiorisk-db
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=SENHA_DO_POSTGRES_CRIADO
JWT_SECRET=gere_uma_chave_secreta_longa_aqui
FRONTEND_URL=https://cardiorisk-frontend.SEU_DOMINIO.easypanel.host
```

> **Importante:** O `DB_HOST` deve ser o nome do serviço PostgreSQL criado no passo 1.

5. Em **"Domains"**, configure um domínio (EasyPanel gera automaticamente)
6. Clique em **Deploy**

---

### 3. Criar o Frontend

1. Clique em **"Create"** → **"App"**
2. Escolha **"GitHub"** e selecione o mesmo repositório
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `cardiorisk-frontend` |
| **Branch** | `main` (ou sua branch) |
| **Dockerfile Path** | `Dockerfile` |
| **Port** | `80` |

4. Em **"Build Arguments"** (ou ARG), adicione:

```
VITE_API_URL=https://cardiorisk-api.SEU_DOMINIO.easypanel.host/api
```

> **Importante:** Substitua pela URL real do seu backend criado no passo 2.

5. Em **"Domains"**, configure o domínio do frontend
6. Clique em **Deploy**

---

## Configuração de Rede Interna (Importante!)

No EasyPanel, os serviços podem se comunicar internamente. Verifique se:

1. O backend e o banco estão no mesmo **Project**
2. O `DB_HOST` usa o nome do serviço (não localhost)

---

## Variáveis de Ambiente - Resumo

### Backend (`cardiorisk-api`)
```env
PORT=3001
NODE_ENV=production
DB_HOST=cardiorisk-db
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<senha_do_postgres>
JWT_SECRET=<chave_secreta_longa>
FRONTEND_URL=https://<url-do-frontend>
```

### Frontend (Build Args)
```env
VITE_API_URL=https://<url-do-backend>/api
```

---

## Testar Localmente com Docker Compose

Antes de subir para o EasyPanel, você pode testar localmente:

```bash
# Na pasta raiz do projeto
docker-compose up --build
```

Acesse:
- Frontend: http://localhost
- Backend: http://localhost:3001/api/health

Para parar:
```bash
docker-compose down
```

---

## Troubleshooting

### Erro de conexão com banco
- Verifique se o nome do `DB_HOST` é o nome do serviço PostgreSQL no EasyPanel
- Confirme que estão no mesmo Project

### Frontend não conecta no backend (CORS)
- Verifique se `FRONTEND_URL` no backend está correto
- Verifique se `VITE_API_URL` no frontend aponta para a URL correta do backend

### Build falha
- Veja os logs no EasyPanel
- Certifique-se que o `Dockerfile Path` está correto

### Página em branco
- Verifique se o build do frontend foi bem sucedido
- Confirme que o `VITE_API_URL` foi passado corretamente como build argument

---

## Atualizar a Aplicação

Após fazer push no GitHub:
1. Vá no serviço no EasyPanel
2. Clique em **"Rebuild"** ou **"Deploy"**

Ou configure **Auto Deploy** para deploy automático a cada push!

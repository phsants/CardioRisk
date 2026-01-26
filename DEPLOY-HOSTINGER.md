# Deploy CardioRisk na VPS Hostinger

## Pré-requisitos
- VPS Hostinger com Ubuntu (recomendado 20.04 ou 22.04)
- Acesso SSH ao servidor

---

## Passo 1: Acessar sua VPS

```bash
ssh root@SEU_IP_DA_VPS
```

---

## Passo 2: Atualizar o Sistema

```bash
apt update && apt upgrade -y
```

---

## Passo 3: Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node -v  # Verificar instalação
```

---

## Passo 4: Instalar PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### Configurar o Banco de Dados

```bash
sudo -u postgres psql
```

Dentro do PostgreSQL:
```sql
CREATE USER cardiorisk_user WITH PASSWORD 'SUA_SENHA_SEGURA';
CREATE DATABASE cardiorisk OWNER cardiorisk_user;
GRANT ALL PRIVILEGES ON DATABASE cardiorisk TO cardiorisk_user;
\q
```

---

## Passo 5: Instalar Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## Passo 6: Instalar PM2 (Gerenciador de Processos)

```bash
npm install -g pm2
```

---

## Passo 7: Criar Usuário para a Aplicação

```bash
adduser --disabled-password --gecos "" cardiorisk
mkdir -p /var/www/cardiorisk
chown -R cardiorisk:cardiorisk /var/www/cardiorisk
```

---

## Passo 8: Fazer Upload do Código

### Opção A: Via Git (Recomendado)

No servidor:
```bash
apt install -y git
cd /var/www/cardiorisk
git clone SEU_REPOSITORIO .
```

### Opção B: Via SFTP/SCP

No seu computador local:
```bash
scp -r C:\code\* root@SEU_IP:/var/www/cardiorisk/
```

---

## Passo 9: Configurar o Backend

```bash
cd /var/www/cardiorisk/backend

# Criar arquivo .env
nano .env
```

Conteúdo do `.env`:
```
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardiorisk
DB_USER=cardiorisk_user
DB_PASSWORD=SUA_SENHA_SEGURA
JWT_SECRET=gere_uma_chave_secreta_longa_aqui_12345
FRONTEND_URL=http://SEU_IP_DA_VPS
```

> **Dica:** Para gerar JWT_SECRET seguro: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

```bash
# Instalar dependências
npm install

# Testar se funciona
npm start
# Ctrl+C para parar

# Iniciar com PM2
pm2 start server.js --name cardiorisk-api
pm2 save
pm2 startup
```

---

## Passo 10: Build do Frontend

```bash
cd /var/www/cardiorisk

# Criar arquivo .env para o frontend
nano .env
```

Conteúdo:
```
VITE_API_URL=http://SEU_IP_DA_VPS/api
```

```bash
# Instalar dependências e fazer build
npm install
npm run build
```

---

## Passo 11: Configurar Nginx

```bash
nano /etc/nginx/sites-available/cardiorisk
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name SEU_IP_OU_DOMINIO;

    # Frontend (arquivos estáticos do React)
    root /var/www/cardiorisk/dist;
    index index.html;

    # Rota para a API (proxy para Node.js)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router - redireciona todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Ativar o site:
```bash
ln -s /etc/nginx/sites-available/cardiorisk /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remover site padrão
nginx -t  # Testar configuração
systemctl restart nginx
```

---

## Passo 12: Configurar Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Passo 13: Testar!

Acesse no navegador:
```
http://SEU_IP_DA_VPS
```

---

## Comandos Úteis

### Ver logs do backend:
```bash
pm2 logs cardiorisk-api
```

### Reiniciar backend:
```bash
pm2 restart cardiorisk-api
```

### Ver status:
```bash
pm2 status
```

### Atualizar código:
```bash
cd /var/www/cardiorisk
git pull
npm install
npm run build
pm2 restart cardiorisk-api
```

---

## Adicionar Domínio (Depois)

Quando tiver um domínio:

1. Aponte o DNS do domínio para o IP da VPS (Registro A)
2. Edite `/etc/nginx/sites-available/cardiorisk` e troque `SEU_IP_OU_DOMINIO` pelo domínio
3. Atualize o `.env` do backend com `FRONTEND_URL=https://seudominio.com`
4. Atualize o `.env` do frontend com `VITE_API_URL=https://seudominio.com/api`
5. Refaça o build do frontend: `npm run build`
6. Reinicie: `systemctl restart nginx && pm2 restart cardiorisk-api`

---

## Adicionar HTTPS com Let's Encrypt (Gratuito)

Quando tiver um domínio:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com
```

O certificado renova automaticamente!

---

## Troubleshooting

### Erro 502 Bad Gateway
- Backend não está rodando: `pm2 status` e `pm2 restart cardiorisk-api`

### Erro de CORS
- Verifique se `FRONTEND_URL` no backend está correto
- Reinicie: `pm2 restart cardiorisk-api`

### Página em branco
- Verifique o build: `ls /var/www/cardiorisk/dist`
- Confira os logs do Nginx: `tail -f /var/log/nginx/error.log`

### Erro de banco de dados
- Verifique credenciais no `.env`
- Teste conexão: `psql -U cardiorisk_user -d cardiorisk -h localhost`

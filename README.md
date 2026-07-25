# 1KMzinho Admin — Frontend

Painel administrativo responsivo em React + TypeScript + Vite.

## Requisitos

- Node.js 20.19+ ou 22.12+
- API Node/Express do 1KMzinho publicada com HTTPS
- Cookies e CORS configurados conforme o diretório `../backend-integration`

## Instalação

```bash
npm install
cp .env.example .env
npm run dev
```

Configure somente:

```env
VITE_API_URL=https://sua-api.com
```

Nunca use variáveis `VITE_` para `DATABASE_URL`, `DIRECT_URL`, Mercado Pago, SMTP, senhas ou tokens administrativos. Tudo isso permanece na API.

## Rotas do painel

- `/login`: autenticação administrativa por cookie httpOnly.
- `/`: dashboard com filtros e atualização automática a cada 30 segundos.
- `/reembolsos`: solicitações pendentes.
- `/novo-evento`: cadastro de evento/lote.

## Endpoints consumidos

- `POST /admin/auth/login`
- `GET /admin/auth/session`
- `POST /admin/auth/logout`
- `GET /admin/dashboard/eventos`
- `GET /admin/dashboard/resumo`
- `POST /admin/eventos/lotes`
- `GET /relatorio/:nomeEvento/pdf`
- `GET /relatorio/:nomeEvento/lote/:lote/pdf`
- `GET /reembolsos/solicitacoes?status=PENDENTE`

Todas as requisições usam `credentials: "include"` para enviar o cookie httpOnly. O frontend não lê nem armazena a sessão.

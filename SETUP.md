# Setup — Crisma Chamada

## Passo 1 — Instalar dependências
```bash
npm install
```

## Passo 2 — Criar arquivo .env.local
Copie `.env.example` para `.env.local` e preencha com as chaves reais:
```bash
cp .env.example .env.local
```

## Passo 3 — Criar banco de dados (Supabase)
```bash
npm run db:push
```

## Passo 4 — Rodar em desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

## Passo 5 — Deploy (Vercel)
1. Push para GitHub
2. Importar projeto no Vercel
3. Adicionar todas as variáveis do .env.local no painel do Vercel
4. Deploy automático

---

## Fluxo de uso

### Professor
1. Acesse o app e faça login com sua conta Google
2. Vá em "Chamada" → clique "Abrir Chamada"
3. Mostre o QR Code na tela para os alunos
4. Quando todos registrarem, clique "Encerrar Chamada"
5. Para exportar: clique "Exportar todas as presenças (CSV)"

### Crismando
1. Escaneie o QR Code com o celular
2. Faça login com sua conta Google (a mesma que o professor cadastrou)
3. Clique "Confirmar Presença"
4. Pronto — aparece a confirmação com horário

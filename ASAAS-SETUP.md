# Ligar a cobrança automática (Asaas)

O código já está pronto. Para ativar o pagamento online (PIX, boleto e cartão), basta
você criar a conta no Asaas e preencher 2–3 variáveis. Sem isso, o app continua
funcionando no **modo manual** (você ativa cada paróquia no Painel do Dono → Assinaturas).

## Passo a passo

1. **Crie a conta** em https://www.asaas.com (grátis). Para testar sem dinheiro real,
   use o ambiente **Sandbox**: https://sandbox.asaas.com

2. **Pegue a chave de API**: no Asaas, em *Configurações → Integrações → API*, copie a
   **API Key**.

3. **Na Vercel** (Settings → Environment Variables do projeto `crisma-chamada`), adicione:
   - `ASAAS_API_KEY` = a chave copiada
   - `ASAAS_BASE_URL` = `https://sandbox.asaas.com/api/v3` (testes) **ou** `https://api.asaas.com/v3` (produção)
   - `ASAAS_WEBHOOK_TOKEN` = invente um texto secreto (ex.: `crisma-2026-xyz`)

4. **Configure o webhook** no Asaas (*Configurações → Notificações/Webhooks*):
   - URL: `https://crisma-chamada.vercel.app/api/webhooks/asaas`
   - Token de autenticação: o **mesmo** valor de `ASAAS_WEBHOOK_TOKEN`
   - Eventos: pagamento **confirmado/recebido**, **vencido** e assinatura **removida**.

5. **Refaça o deploy** (qualquer push, ou "Redeploy" na Vercel) para as variáveis valerem.

Pronto. A partir daí, na tela **/assinatura** a coordenadora vê os botões *Assinar mensal/anual*,
paga via Asaas, e o acesso é **liberado e renovado automaticamente** pelo webhook.

## Como funciona no código
- `src/lib/asaas.ts` — cliente da API (cria cliente + assinatura, devolve link de pagamento).
- `src/app/api/assinatura/checkout/route.ts` — a coordenadora inicia a assinatura.
- `src/app/api/webhooks/asaas/route.ts` — recebe os eventos do Asaas e atualiza a situação.
- Sem `ASAAS_API_KEY`, o checkout responde "ainda não configurado" e nada quebra.

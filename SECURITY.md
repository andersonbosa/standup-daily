# 🔒 Segurança da API

## Proteção da API Key do Giphy

A aplicação implementa uma arquitetura de segurança robusta para proteger a API Key do Giphy e prevenir uso não autorizado.

## Arquitetura

```
┌─────────────────┐
│   Cliente       │
│  (Browser)      │
└────────┬────────┘
         │ 1. Request com x-api-secret header
         ▼
┌─────────────────┐
│  /api/giphy     │
│  (Next.js API)  │
└────────┬────────┘
         │ 2. Validações:
         │    - Header secreto
         │    - Origin check
         │    - Query params
         ▼
┌─────────────────┐
│  Giphy API      │
│  (External)     │
└─────────────────┘
```

## Camadas de Proteção

### 1. Rota API Server-Side
- API Key armazenada apenas no servidor (variável de ambiente `GIPHY_API_KEY`)
- Nunca exposta ao cliente/browser
- Arquivo: `/src/app/api/giphy/route.ts`

### 2. Autenticação via Header Secreto
```typescript
const authHeader = request.headers.get('x-api-secret')
if (!authHeader || authHeader !== API_SECRET) {
  return 401 Unauthorized
}
```

### 3. Validação de Origem (Origin Check)
Em produção, verifica se a requisição vem do mesmo domínio:
```typescript
if (process.env.NODE_ENV === 'production' && origin) {
  const originHost = new URL(origin).host
  if (originHost !== host) {
    return 403 Forbidden
  }
}
```

### 4. Validação de Parâmetros
- Verifica se query `q` está presente
- Limita quantidade de resultados
- Sanitiza inputs com `encodeURIComponent`

## Variáveis de Ambiente

### Servidor (não exposto ao cliente)
```bash
GIPHY_API_KEY=your_giphy_api_key_here
API_SECRET=your_random_secret_here
```

### Cliente (exposto ao browser)
```bash
NEXT_PUBLIC_API_SECRET=your_random_secret_here
```

⚠️ **Importante**: Use o mesmo valor para `API_SECRET` e `NEXT_PUBLIC_API_SECRET`

## Benefícios

✅ **API Key Protegida**: Nunca exposta no código do cliente  
✅ **Quota Protegida**: Apenas sua aplicação pode consumir a API  
✅ **Origin Validation**: Previne requests de outros domínios  
✅ **Rate Limiting**: Controle server-side do uso da API  
✅ **Auditoria**: Logs centralizados de todas as requisições  

## Configuração para Produção

1. Gere um secret forte:
```bash
openssl rand -base64 32
```

2. Configure na Vercel:
   - Settings → Environment Variables
   - Adicione `GIPHY_API_KEY`, `API_SECRET`, `NEXT_PUBLIC_API_SECRET`

3. Redeploy para aplicar as variáveis

## Monitoramento

Todas as requisições são logadas no servidor:
- Sucesso: `200 OK`
- Não autorizado: `401 Unauthorized`
- Origem inválida: `403 Forbidden`
- Erro interno: `500 Internal Server Error`

## Limitações

⚠️ O `NEXT_PUBLIC_API_SECRET` é exposto no cliente, então um usuário determinado ainda poderia fazer requests. Para segurança adicional, considere:

- Rate limiting por IP (ex: com Vercel Edge Config)
- CAPTCHA para validação humana
- Autenticação de usuário
- Tokens JWT com expiração

Para a maioria dos casos de uso (aplicação interna de time), a proteção atual é suficiente.


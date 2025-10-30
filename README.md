# ⏰ Daily Timer

Uma aplicação web moderna e divertida para facilitar as reuniões diárias (Daily Stand-ups) de times de tecnologia ou engenharia.

## 🎨 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Chakra UI** - Sistema de componentes profissional e acessível
- **Emotion** - CSS-in-JS para estilização
- **React Hooks** - Gerenciamento de estado
- **localStorage** - Persistência de dados
- **Giphy API** - GIFs animados de celebração
- **Vercel Analytics** - Analytics de produção
- **Speed Insights** - Monitoramento de performance
- **Web Vitals** - Métricas de UX

## 🏃‍♂️ Como Executar

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione sua chave:
- `GIPHY_API_KEY`: Obtenha em [Giphy Developers](https://developers.giphy.com/)
- `ALLOWED_ORIGINS` (opcional): Lista de origens permitidas separadas por vírgula

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🎯 Como Usar

1. **Configure sua Daily**: Adicione os participantes do time, defina o tempo total e marque quem está ausente
2. **Inicie a Daily**: Clique em "Iniciar Daily" e acompanhe o tempo de cada participante
3. **Gerencie o Tempo**: Use os controles para pausar, avançar ou reiniciar conforme necessário
4. **Veja o Resumo**: Ao final, confira as estatísticas e comemore com o time!

## 🎉 Diferenciais

- 🎨 Interface moderna e intuitiva com dark mode
- 🎊 Animações e efeitos visuais divertidos
- 💾 Configurações salvas automaticamente
- ⚡ Experiência fluida e rápida
- 🎯 Foco na produtividade e engajamento do time
- 🌍 Suporte a 3 idiomas (PT-BR, EN, ES)
- 📊 Analytics e monitoramento de performance integrados
- 🚀 Pronto para produção na Vercel

## 🚀 Deploy

A aplicação está pronta para produção! Basta fazer deploy na Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Variáveis de Ambiente na Vercel

Ao fazer deploy, configure as seguintes variáveis de ambiente no painel da Vercel:

1. `GIPHY_API_KEY` - Sua chave da API do Giphy
2. `ALLOWED_ORIGINS` (opcional) - Lista de origens permitidas separadas por vírgula

### 🔒 Segurança e Otimização da API

A aplicação implementa proteção da API Key do Giphy através de:
- ✅ Rota API server-side (`/api/giphy`)
- ✅ Verificação CORS (origin) em produção
- ✅ API Key nunca exposta no cliente
- ✅ Proteção contra uso não autorizado da quota
- ✅ **Cache em memória (24h)** - Reduz drasticamente o uso da quota
- ✅ **Cache HTTP/CDN** - Vercel Edge Network cache por 24h
- ✅ **Stale-while-revalidate** - Serve cache antigo enquanto atualiza

## 📝 Licença

Este projeto foi criado para facilitar as dailies de times de tecnologia.

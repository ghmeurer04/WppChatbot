# CidaChatbot

Um chatbot inteligente para WhatsApp integrado com IA generativa do Google, MongoDB e webhook Stripe.

## 🚀 Funcionalidades

- **WhatsApp Integration**: Conecte-se ao WhatsApp Web usando `whatsapp-web.js`
- **IA Generativa**: Integração com Google Generative AI para respostas inteligentes
- **Banco de Dados**: MongoDB para armazenar mensagens e dados
- **Webhooks Stripe**: Processamento de eventos de pagamento
- **QR Code**: Autenticação via QR Code no terminal
- **Autenticação Local**: Suporte para autenticação persistente

## 📋 Pré-requisitos

- Node.js v18+
- npm ou yarn
- MongoDB
- Chave API do Google Generative AI para fotos/mensagens de voz
- Chave secreta do Stripe
- Chave API do OpenAI para mensagens de texto

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ghmeurer/CidaChatbot.git
cd CidaChatbot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```env
GOOGLE_API_KEY=sua_chave_api_google
STRIPE_SECRET_KEY=sua_chave_stripe
MONGODB_URI=sua_uri_mongodb
```

## 🏗️ Estrutura do Projeto

```
CidaChatbot/
├── chatbot.js           # Lógica principal do chatbot WhatsApp
├── database.mjs         # Integração com MongoDB
├── messages.js          # Gerenciamento de mensagens
├── webhook.cjs          # Webhook Stripe
├── LocalAuth.cjs        # Autenticação WhatsApp Web
├── package.json         # Dependências do projeto
└── README.md           # Este arquivo
```

## 📝 Uso

Inicie o chatbot:
```bash
npm start
```

Ou com Node.js diretamente:
```bash
node chatbot.js
```

1. Um QR Code será exibido no terminal
2. Escaneie com seu WhatsApp
3. O bot estará pronto para receber e responder mensagens

## 🔌 Dependências Principais

- **whatsapp-web.js**: Cliente WhatsApp Web para Node.js
- **@google/generative-ai**: API de IA generativa do Google
- **mongodb**: Driver MongoDB para Node.js
- **express**: Framework para webhooks (se usando)
- **stripe**: Integração com pagamentos Stripe
- **moment-timezone**: Gerenciamento de fusos horários
- **qrcode-terminal**: Geração de QR Code no terminal

## ⚙️ Configuração Avançada

### Timeout de Mensagens
Edite `chatbot.js` para ajustar:
- `MIN_TIME`: Tempo mínimo entre respostas (ms)
- `MAX_TIME`: Tempo máximo entre respostas (ms)
- `REQUEST_LIMIT`: Limite de requisições

### Webhook Stripe
Configure seu endpoint Stripe em `webhook.cjs` com sua chave de webhook secreta.

## 📄 Licença

Este projeto é licenciado **apenas para uso não comercial**.  
O uso comercial requer autorização explícita do autor.


## 👤 Autor

Gabriel Meurer - [@ghmeurer](https://github.com/ghmeurer)

---

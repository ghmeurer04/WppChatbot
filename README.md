# WhatsappChatbot

An intelligent WhatsApp chatbot integrated with Google Generative AI, MongoDB, and Stripe webhooks.

## 🚀 Features

- **WhatsApp Integration**: Connects to WhatsApp Web using `whatsapp-web.js`
- **Generative AI**: Integration with Google Generative AI for intelligent responses
- **Database**: MongoDB for storing messages and application data
- **Stripe Webhooks**: Payment event processing
- **QR Code**: QR Code authentication directly in the terminal
- **Local Authentication**: Persistent WhatsApp authentication support

## 📋 Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB
- Google Generative AI API key (for images/voice messages)
- Stripe secret key
- OpenAI API key (for text messages)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/ghmeurer/WppChatbot.git
cd WppChatbot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the project root with:
```env
GOOGLE_API_KEY=your_google_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
MONGODB_URI=your_mongodb_uri
```

## 🏗️ Project Structure

```
WppChatbot/
├── chatbot.js           # Main WhatsApp chatbot logic
├── database.mjs         # MongoDB integration
├── messages.js          # Message handling
├── webhook.cjs          # Stripe webhook
├── LocalAuth.cjs        # WhatsApp Web authentication
├── package.json         # Project dependencies
└── README.md            # This file
```

## 📝 Usage

Start the chatbot:
```bash
npm start
```

Or run it directly with Node.js:
```bash
node chatbot.js
```

1. A QR Code will be displayed in the terminal
2. Scan it using your WhatsApp app
3. The bot will be ready to receive and respond to messages

## 🔌 Main Dependencies

- **whatsapp-web.js**: WhatsApp Web client for Node.js
- **@google/generative-ai**: Google Generative AI API
- **mongodb**: MongoDB driver for Node.js
- **express**: Web framework (used for webhooks if enabled)
- **stripe**: Stripe payments integration
- **moment-timezone**: Timezone handling
- **qrcode-terminal**: QR Code generation in the terminal

## ⚙️ Advanced Configuration

### Message Timeout
Edit `chatbot.js` to adjust:
- `MIN_TIME`: Minimum delay between responses (ms)
- `MAX_TIME`: Maximum delay between responses (ms)
- `REQUEST_LIMIT`: Request limit

### Stripe Webhook
Configure your Stripe endpoint in `webhook.cjs` using your webhook secret key.

## 📄 License

This project is licensed **for non-commercial use only**.  
Commercial use requires explicit authorization from the author.

## 👤 Author

Gabriel Meurer – [@ghmeurer](https://github.com/ghmeurer)

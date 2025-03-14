# FiboFinance

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0.4-black)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emiyaaaaa/fibofinance)

FiboFinance is an AI-powered asset allocation application that uses the Golden Ratio (Fibonacci sequence) principle to help users manage their financial portfolios more effectively.

## ✨ Features

- **Smart Asset Allocation** - Optimize your portfolio based on the Golden Ratio principle
- **AI Financial Advisor** - Get personalized financial advice with OpenAI integration
- **Real-time Streaming Response** - Experience seamless AI interactions with streaming API responses
- **Multi-language Support** - Available in English and Chinese
- **Modern UI** - Clean, responsive interface built with HeroUI components
- **Dark/Light Mode** - Customizable theme to suit your preference

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Components**: HeroUI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **AI Integration**: [OpenAI API](https://openai.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Development**: TypeScript, ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/emiyaaaaa/fibofinance.git
   cd fibofinance
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o  # or your preferred model
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

- **OpenAI**: Configure OpenAI settings in `.env.local`
- **Language**: Set default language or add more languages in `i18n` directory

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) for the amazing framework
- [OpenAI](https://openai.com/) for the powerful AI capabilities
- [HeroUI](https://github.com/heroui) for the beautiful UI components

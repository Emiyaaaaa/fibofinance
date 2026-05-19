<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/logo-dark.svg" width="70%">
    <source media="(prefers-color-scheme: light)" srcset="./public/logo-light.svg" width="70%">
    <img alt="fibofinance logo" src="./public/logo-light.svg" width="70%">
  </picture>
  <p align="center">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-blue">
    <img alt="Self-hosted" src="https://img.shields.io/badge/self--hosted-vercel-black">
  </p>
  <img alt="fibofinance demo" src="./public/en/demo.png">
</p>

[English](./README.md) | [简体中文](./README_ZH.md)

FiboFinance is a lightweight, self-hosted asset tracking app: record assets, view trends and allocation, and get AI analysis when needed.

## Demo

https://fibofinance.cn

## Highlights

- Self-hosted, data-secure, and password-protected
- Supports group management
- Multi-currency support with custom exchange rates (silver, gold, and similar assets can be recorded by gram and automatically converted to CNY)
- Supports trend charts, allocation pie charts, and history records
- Supports AI analysis

## Deployment

One-click deployment on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emiyaaaaa/fibofinance)

Create a Neon database
![Deployment screenshot](./public/database.png)

Connect the database
![Deployment screenshot](./public/connect-database.png)

Configure AI analysis (optional)
![Deployment screenshot](./public/settings-env.png)

Database initialization runs during the build process, so deployment may fail if the database is not connected. If that happens, connect the database and redeploy.

## Local Development

Configure `.env.local`

```bash
DATABASE_URL="postgres://..."
OPENAI_API_KEY="" # Optional
OPENAI_MODEL="" # Optional
OPENAI_BASE_URL="" # Optional
```

Start the app

```bash
npm install

npm run dev
```

## License

[MIT](./LICENSE)

<p align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/logo-dark.svg" width="60%">
    <source media="(prefers-color-scheme: light)" srcset="./public/logo-light.svg" width="60%">
    <img alt="fibofinance logo" src="./public/logo-light.svg" width="60%">
  </picture>
  <br>
  <p align="center">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-blue">
    <img alt="Self-hosted" src="https://img.shields.io/badge/self--hosted-vercel-black">
    <img alt="Mobile Friendly" src="https://img.shields.io/badge/mobile--friendly-yes-brightgreen">
  </p>
  <p align="center">
    <a href="./README.md">English</a> | <a href="./README_ZH.md">简体中文</a>
  </p>
  <img alt="fibofinance demo" src="./public/en/demo.png">
</p>

FiboFinance is a lightweight, self-hosted asset tracking app that tracks asset changes by recording current asset values, moving beyond traditional bookkeeping.

## Demo

https://fibofinance.cn

## Highlights

- Easy deployment, data security, and password protection
- Personal and family asset grouping without mixing assets
- Multi-currency support with custom exchange rates (silver, gold, and similar assets can be recorded by gram)
- Asset trend charts and flexible comparison of asset changes
- Configure an AI key for asset allocation recommendations

## Deployment

One-click deployment on Vercel (not recommended, because it creates a brand-new repository instead of a fork)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emiyaaaaa/fibofinance)

Deploy on Vercel after forking the repository (recommended, because you can sync the latest code with one click)
![Deployment screenshot](./public/vercel-new-project.png)

Create a Neon database in Vercel
![Deployment screenshot](./public/neon.png)

Deployment successful
![Deployment screenshot](./public/deploy-success.png)

Connect the database, and the environment variables will be automatically injected after successful connection
![Deployment screenshot](./public/connect-database.png)

Redeploy after connecting the database
![Deployment screenshot](./public/redeploy.png)

Configure AI analysis (optional)
![Deployment screenshot](./public/ai-env.png)

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

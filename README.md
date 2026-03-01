# ContentBlast

AI-powered content repurposing. Write once, publish everywhere.

## Quick Setup

### 1. Install dependencies
```bash
npm install
npm install @anthropic-ai/sdk stripe
```

### 2. Set up Supabase
- Go to [supabase.com](https://supabase.com) and create a new project
- Go to **SQL Editor** and paste the contents of `supabase-schema.sql`, then run it
- Go to **Settings > API** and copy your Project URL and anon/public key

### 3. Set up Stripe
- Go to [dashboard.stripe.com](https://dashboard.stripe.com)
- Create 3 products with monthly prices: Starter (£12), Growth (£39), Scale (£79)
- Copy each price ID (starts with `price_`)
- Set up a webhook endpoint pointing to `https://your-domain.com/api/stripe-webhook`
- Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`

### 4. Get Anthropic API key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an API key

### 5. Configure environment
```bash
cp .env.example .env
```
Fill in all the values in `.env`

### 6. Run locally
```bash
npm run dev
```

### 7. Deploy to Vercel
```bash
npx vercel
```
Add all env vars in Vercel dashboard > Settings > Environment Variables.

## Project Structure
```
contentblast/
├── api/                    # Vercel serverless functions
│   ├── blast.js           # Core AI repurposing endpoint
│   ├── create-checkout.js # Stripe checkout creation
│   ├── stripe-webhook.js  # Stripe event handler
│   └── billing-portal.js  # Stripe customer portal
├── src/
│   ├── App.jsx            # Main React app
│   ├── main.jsx           # Entry point
│   ├── index.css          # Global styles
│   └── lib/
│       └── supabase.js    # Supabase client
├── public/
│   └── favicon.svg
├── supabase-schema.sql    # Database schema
├── vercel.json            # Vercel config
├── .env.example           # Environment template
└── package.json
```

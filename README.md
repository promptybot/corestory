# Promptly — Core Story Builder

An AI-powered web app that generates complete Core Story buying narratives for any business, based on the Empire Research Group / Chet Holmes methodology.

## How it works

1. **User enters basics** — business name, website URL, niche, offer, pricing, CTA
2. **AI analyzes** — scrapes their website + uses industry knowledge to pre-fill 15 questions (UVP, pain points, WOW stats, strategies, positioning)
3. **Owner reviews & edits** — every field is editable before generation
4. **Full Core Story generated** — 12 sections including stadium pitch, download as .txt

---

## Deploy to Vercel (5 minutes)

### 1. Get an Anthropic API key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an account and generate an API key

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create promptly-core-story --public --push
```

### 3. Deploy on Vercel
- Go to [vercel.com](https://vercel.com) and sign in with GitHub
- Click "Add New Project" → import your repo
- Under **Environment Variables**, add:
  - Key: `ANTHROPIC_API_KEY`
  - Value: your key from step 1
- Click Deploy

Your app will be live at `https://your-project.vercel.app` in ~2 minutes.

---

## Run locally

```bash
# Install dependencies
npm install

# Create your .env.local file
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Customization

- **Branding**: Edit colors in `tailwind.config.js` (change `brand` color values)
- **Logo/name**: Edit the nav in `pages/index.js`
- **AI prompts**: Customize the system prompts in `pages/api/story.js`
- **Questions**: Add/remove fields in the `SECTIONS` array in `pages/index.js`

---

## Tech stack

- **Next.js 14** — React framework
- **Tailwind CSS** — styling
- **Anthropic Claude API** — AI (claude-opus-4-5 for analysis, claude-opus-4-5 for generation)
- **Vercel** — hosting (free tier works)

---

## Core Story sections generated

1. Presentation title
2. Unique value proposition
3. Market landscape (WOW statistics)
4. Pain point 1, 2, 3
5. Strategy 1, 2, 3
6. Positioning narrative
7. Offer & call to action
8. Stadium pitch (30-second summary)

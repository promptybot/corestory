import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { action, payload } = req.body

  try {
    if (action === 'analyze') {
      return await analyzeWebsite(req, res, payload)
    }
    if (action === 'generate') {
      return await generateStory(req, res, payload)
    }
    return res.status(400).json({ error: 'Unknown action' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}

// ─── Step 1: Scrape website + auto-fill answers ──────────────────────────────
async function analyzeWebsite(req, res, { websiteUrl, businessName, businessType, offerName, offerPrice, cta }) {

  // Fetch the website HTML
  let websiteContent = ''
  if (websiteUrl) {
    try {
      const fetchRes = await fetch(websiteUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CoreStoryBot/1.0)' },
        signal: AbortSignal.timeout(8000)
      })
      const html = await fetchRes.text()
      // Strip HTML tags, collapse whitespace, take first 6000 chars
      websiteContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 6000)
    } catch (e) {
      websiteContent = 'Website could not be fetched.'
    }
  }

  const prompt = `You are an expert business strategist and Core Story architect trained in the Chet Holmes / Empire Research Group methodology.

A business owner has given you the following information:
- Business name: ${businessName}
- Business type/niche: ${businessType}
- Website URL: ${websiteUrl || 'not provided'}
- Website content scraped: """${websiteContent}"""
- Core offer name: ${offerName || 'not provided'}
- Offer pricing: ${offerPrice || 'not provided'}
- Call to action: ${cta || 'not provided'}

Your job is to use your deep knowledge of this type of business, its market psychology, buyer behavior, industry statistics, and competitive landscape to PRE-FILL a complete Core Story questionnaire on behalf of the business owner.

You know MORE about the psychology of their buyers than most business owners do. Use real, credible market statistics (cite sources where possible). Write from the perspective of someone who has studied this industry deeply.

Return a JSON object with these exact fields — write confidently, specifically, and in complete sentences:

{
  "target": "Detailed description of the ideal customer profile for this business type",
  "uvp": "A sharp unique value proposition that differentiates this business from generic competitors",
  "objections": "The 3 most common reasons prospects don't buy from this type of business",
  "stat1": "A surprising, specific, credible WOW statistic about this industry or market that creates urgency — cite a plausible source",
  "stat2": "A second WOW stat about a trend showing the problem is getting worse or the stakes are higher",
  "stat3": "A third WOW stat that reframes how buyers should think — makes the investment obvious",
  "pain1": "The #1 most painful, universal frustration this type of business's customers face — written from the customer's emotional perspective",
  "pain2": "A second, less obvious pain point that compounds the first — the hidden cost or systemic problem",
  "pain3": "The emotional and relational cost of the problem going unsolved — fear, anxiety, opportunity cost",
  "step1": "An educational strategy or insight this business type should follow — tell WHAT not HOW, leads to needing this service",
  "step2": "A second educational strategy that builds the case for professional help",
  "step3": "A third strategy that makes the business the logical next step",
  "pos_unique": "What this business understands about the market that competitors miss — the insider insight",
  "pos_proof": "The type of results and transformation clients can expect (use realistic ranges since this is a new company)",
  "pos_criteria": "The buying criteria prospects should use that naturally favor this business over generic alternatives"
}

Return ONLY valid JSON. No markdown fences. No explanation text.`

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = message.content[0].text.replace(/```json|```/g, '').trim()
  const prefilled = JSON.parse(raw)

  return res.status(200).json({ prefilled, websiteContent: websiteContent.slice(0, 200) })
}

// ─── Step 2: Generate full Core Story ────────────────────────────────────────
async function generateStory(req, res, answers) {
  const prompt = `You are a master Core Story writer trained in the Empire Research Group / Chet Holmes methodology. 

A Core Story is a structured educational buying narrative — NOT a sales pitch. It follows this logic:
Title → UVP Statement → Market Landscape (Stats) → Pain Points → Steps & Strategies → Positioning → Sponsor/Offer Section → Stadium Pitch

Using the answers below, write a complete, polished, professional Core Story. Write in authoritative prose paragraphs. The tone is that of a trusted market expert educating the reader — not a vendor selling. Each section must flow naturally into the next. By the end, the reader should think: "They understand my world better than anyone. They are the only logical choice."

INPUTS:
Business Name: ${answers.businessName}
Business Type: ${answers.businessType}
Website: ${answers.websiteUrl}
Target Market: ${answers.target}
UVP: ${answers.uvp}
Buying Objections: ${answers.objections}
WOW Stat 1: ${answers.stat1}
WOW Stat 2: ${answers.stat2}
WOW Stat 3: ${answers.stat3}
Pain Point 1: ${answers.pain1}
Pain Point 2: ${answers.pain2}
Pain Point 3: ${answers.pain3}
Strategy 1: ${answers.step1}
Strategy 2: ${answers.step2}
Strategy 3: ${answers.step3}
Positioning — unique insight: ${answers.pos_unique}
Positioning — results/proof: ${answers.pos_proof}
Positioning — buying criteria: ${answers.pos_criteria}
Offer Name: ${answers.offerName}
Offer Price: ${answers.offerPrice}
Offer Description: ${answers.offerDesc}
Investment Framing: ${answers.offerValue}
Call to Action: ${answers.cta}

Return a JSON object with these exact keys. Write 2–4 rich prose paragraphs for landscape and positioning, 1 strong paragraph for each pain/strategy, concise for uvp_statement and title:
{
  "title": "Compelling presentation title aimed at the target market — creates curiosity, not a company name",
  "uvp_statement": "One powerful sentence — the unique value proposition that resets buying criteria",
  "landscape": "2-3 paragraphs using the WOW stats to paint a market picture that creates urgency — written for the skeptical 90% who don't think they need help yet",
  "pain1_narrative": "Paragraph on pain point 1 — vivid, from the customer's perspective, emotionally resonant",
  "pain2_narrative": "Paragraph on pain point 2 — the hidden or systemic layer that makes pain 1 worse",
  "pain3_narrative": "Paragraph on pain point 3 — the emotional cost of doing nothing. End with a moment of recognition",
  "strategy1_narrative": "Educational paragraph on strategy 1 — tell WHAT not HOW, builds authority",
  "strategy2_narrative": "Educational paragraph on strategy 2 — deepens the case for professional guidance",
  "strategy3_narrative": "Educational paragraph on strategy 3 — ends with a natural bridge toward the solution",
  "positioning_narrative": "2 strong paragraphs — positions the company as the only logical choice through insight and criteria, not bragging",
  "sponsor_narrative": "1-2 paragraphs — introduces the offer naturally, frames investment as ROI, delivers the CTA with conviction",
  "stadium_pitch": "4-sentence summary: attention-getter, compelling explanation, secret sauce, offer. Should work as a 30-second verbal pitch."
}

Return ONLY valid JSON. No markdown. No explanation.`

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = message.content[0].text.replace(/```json|```/g, '').trim()
  const story = JSON.parse(raw)

  return res.status(200).json({ story })
}

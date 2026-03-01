import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PLATFORM_INSTRUCTIONS = {
  twitter: "Twitter/X: Thread format with numbered tweets (1/, 2/, etc). Punchy hook on tweet 1. Max 280 chars per tweet. End with a call to action.",
  linkedin: "LinkedIn: Professional narrative with line breaks for readability. Open with a bold statement or question. 1-3 relevant hashtags at the end. 1300 chars max.",
  instagram: "Instagram: Engaging caption with relevant emojis. Conversational tone. Hashtag block at the end (8-15 hashtags). 2200 chars max.",
  newsletter: "Newsletter: Email-ready snippet. Start with 'Subject: [subject line]' then the body. Scannable with a clear takeaway.",
  youtube_short: "YouTube Short Script: 60-second spoken script. Format as [HOOK] (first 3 seconds), [BODY], [CTA]. Write as spoken word, not written text.",
  tiktok: "TikTok Script: Hook-driven 30-60 second script. [HOOK] must grab attention in first 2 seconds. Casual, energetic tone. [BODY] and [CTA] sections.",
  facebook: "Facebook: Conversational, community-oriented post. Ask a question or invite discussion. Warm and personal. 500 chars ideal.",
  blog_summary: "Blog Summary: SEO-optimised paragraph. Include relevant keywords naturally. 150-200 words. Can be used as a meta description or summary.",
  reddit: "Reddit: Discussion-starter style. Authentic, no-BS tone. Start with context, ask for opinions. No hashtags. Title + body format.",
  threads: "Threads: Casual, conversational short post. Like texting a smart friend. 500 chars max. No hashtags unless very relevant.",
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Verify auth
  const token = req.headers.authorization?.replace("Bearer ", "")
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: "Invalid token" })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" })
  }

  // Check usage limits
  if (profile.blasts_used >= profile.blasts_limit) {
    return res.status(429).json({ error: "Blast limit reached. Please upgrade your plan." })
  }

  const { content, title, platforms, tone, brand_voice } = req.body

  if (!content || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: "Content and at least one platform are required." })
  }

  // Build platform instructions
  const platformInstructions = platforms
    .map(id => PLATFORM_INSTRUCTIONS[id])
    .filter(Boolean)
    .map(inst => `- ${inst}`)
    .join("\n")

  const brandVoiceInstruction = brand_voice
    ? `\n\nBRAND VOICE: The user has specified this brand voice — match it closely:\n${brand_voice}`
    : ""

  const systemPrompt = `You are ContentBlast, an AI content repurposing engine. You take long-form content and create platform-native posts.

RULES:
- Each output must be NATIVE to the platform — not just shortened or truncated
- Match the format, length, hooks, hashtags, and style conventions of each platform
- Content should be high quality and ready to publish immediately
- Never add disclaimers like "here's your content" — just output the content itself${brandVoiceInstruction}

OUTPUT: Return ONLY a valid JSON object with this exact structure:
{"results": [{"platform": "Platform Name", "platform_id": "platform_id", "content": "The repurposed content", "char_count": 123}]}

No markdown, no backticks, no extra text. Just the JSON.`

  const userPrompt = `TONE: ${tone}

PLATFORMS TO CREATE FOR:
${platformInstructions}

ORIGINAL CONTENT:
${content}`

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const responseText = message.content
      .map(block => block.text || "")
      .join("")

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse AI response" })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Save blast to database
    await supabase.from("blasts").insert({
      user_id: user.id,
      title: title || content.substring(0, 100),
      original_content: content,
      platforms,
      tone,
      results: parsed.results,
    })

    // Increment usage
    await supabase
      .from("profiles")
      .update({ blasts_used: profile.blasts_used + 1 })
      .eq("id", user.id)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error("Blast error:", err)
    return res.status(500).json({ error: "AI generation failed. Please try again." })
  }
}

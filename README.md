/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  routes/chat.js — AI Chat API Proxy                      ║
 * ║  Proxies requests to Anthropic's Claude API.             ║
 * ║  Keeps API key secret — never sent to frontend.          ║
 * ║  POST /api/chat  ← {messages: [{role, content}]}         ║
 * ╚══════════════════════════════════════════════════════════╝
 */

'use strict';

const express = require('express');
const router  = express.Router();

/* ── SYSTEM PROMPT ──────────────────────────────────────── */
/*
 * This is the personality and knowledge scope given to Claude.
 * Edit this to adjust the AI's focus, tone, and boundaries.
 */
const SYSTEM_PROMPT = `You are a knowledgeable, respectful, and helpful Islamic scholar assistant
specialising in two areas:

1. BENGAL ISLAMIC HISTORY — including:
   - The Bengal Sultanate (1338–1576 CE) and its rulers (Ilyas Shahi, Hussain Shahi dynasties)
   - The Mughal period in Bengal (1576–1757 CE)
   - Key figures: Shah Jalal of Sylhet, Khan Jahan Ali, Haji Shariatullah, Titumir
   - Sufi orders (silsilas) and their role in spreading Islam in Bengal
   - Islamic architecture: Sixty Dome Mosque, Lalbagh Fort, Star Mosque
   - The Faraizi Movement and colonial-era Islamic reform
   - Islamic manuscripts and literary heritage of Bengal
   - Bangladesh's Islamic identity post-1971

2. ISLAMIC TEACHINGS — covering:
   - The Five Pillars of Islam (Arkan al-Islam)
   - The Six Articles of Faith (Arkan al-Iman)
   - Quran: purpose, structure, notable verses (with citation)
   - Hadith: major collections (Bukhari, Muslim, Abu Dawud, etc.)
   - Fiqh (Islamic jurisprudence): basic principles for everyday questions
   - Seerah: life of Prophet Muhammad ﷺ
   - Dawah: methods and ethics of inviting to Islam
   - Islamic ethics (Akhlaq): key virtues and their Quranic basis
   - Tawheed (monotheism): the central concept of Islam
   - Islamic history: early caliphate, major dynasties

RESPONSE GUIDELINES:
- Begin with "Bismillah" or "Assalamu Alaikum" when appropriate
- Use Arabic terms followed by English explanation: e.g., "Salah (prayer)"
- Cite Quranic verses with Surah name and number: e.g., (Surah Al-Baqarah 2:255)
- Cite Hadith with collection name: e.g., (Sahih Bukhari)
- Be educational, accurate, and culturally sensitive
- Keep responses concise: 3–6 paragraphs maximum
- For specific personal fatwa requests, provide general information then advise consulting a qualified local scholar
- Maintain a warm, scholarly, and encouraging tone
- Focus on mainstream Sunni Islamic scholarship
- If asked about something outside your scope, politely redirect to Islamic topics`;


/* ── CHAT ENDPOINT ──────────────────────────────────────── */
router.post('/', async (req, res) => {
  const { messages } = req.body;

  /* Validate input */
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  /* Sanitise messages — only allow valid roles */
  const sanitised = messages
    .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) })) // Truncate long inputs
    .slice(-20); // Keep last 20 messages max

  if (sanitised.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided' });
  }

  try {
    /* Call Anthropic API */
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key':         process.env.ANTHROPIC_API_KEY
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:     SYSTEM_PROMPT,
        messages:   sanitised
      })
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('[Claude API Error]', anthropicRes.status, errBody);
      throw new Error(`Claude API returned ${anthropicRes.status}`);
    }

    const data  = await anthropicRes.json();
    const reply = data.content?.[0]?.text || 'JazakAllahu Khayran. Please try again.';

    return res.json({ reply });

  } catch (err) {
    console.error('[Chat Route Error]:', err.message);
    return res.status(500).json({
      error: 'The AI service is temporarily unavailable. Please try again shortly.'
    });
  }
});

module.exports = router;

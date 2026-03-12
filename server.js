/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  routes/entries.js — Superdatabase CRUD API              ║
 * ║  GET    /api/entries         — search + filter + paginate║
 * ║  GET    /api/entries/:id     — get single entry          ║
 * ║  POST   /api/entries         — create new entry          ║
 * ║  PUT    /api/entries/:id     — update entry              ║
 * ║  DELETE /api/entries/:id     — delete entry              ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * NOTE: This uses an in-memory store for the demo.
 *       In production, replace with a real database using
 *       the schema defined in database/schema.sql
 */

'use strict';

const express = require('express');
const router  = express.Router();

/* ── SEED DATA (In-memory database) ─────────────────────── */
/*
 * Production: Replace this with actual DB queries.
 * Use the schema in database/schema.sql with SQLite/PostgreSQL.
 */
let entries = [
  {
    id: 1, category: 'Mosque', era: 'Bengal Sultanate',
    title: 'Sixty Dome Mosque (Shat Gambuj Masjid)',
    excerpt: 'UNESCO World Heritage Site — the largest medieval mosque in Bangladesh.',
    description: 'Built c.1459 CE in Bagerhat by the Turkish general and administrator Khan Jahan Ali. The mosque features 77 domes and 60 stone pillars, making it the largest medieval mosque in Bangladesh and a masterpiece of the Bengal Sultanate architectural tradition.',
    location: 'Bagerhat, Bangladesh',
    year_ce: 1459, year_hijri: 863,
    tags: ['architecture', 'UNESCO', 'mosque', 'Khan Jahan Ali'],
    source_url: 'https://whc.unesco.org/en/list/321',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2, category: 'Scholar', era: 'Medieval Bengal',
    title: 'Shah Jalal of Sylhet (Shahjalal Mujarrad)',
    excerpt: 'The most venerated Sufi saint of Bengal, who arrived with 360 companions.',
    description: 'Shah Jalal (c.1271–1346 CE) was a Sufi missionary of the Suhrawardiyya order who arrived in Sylhet from Mecca with 360 disciples to spread Islam. His shrine in Sylhet is among the most visited Islamic sites in Bangladesh. He is revered as a Wali Allah.',
    location: 'Sylhet, Bangladesh',
    year_ce: 1303, year_hijri: 703,
    tags: ['sufi', 'scholar', 'saint', 'sylhet', 'missionary'],
    source_url: 'https://en.wikipedia.org/wiki/Shah_Jalal',
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: 3, category: 'Historical Event', era: 'Bengal Sultanate',
    title: 'Establishment of the Bengal Sultanate (1338 CE)',
    excerpt: 'The independent Bengal Sultanate established with Gaur as capital.',
    description: 'Fakhruddin Mubarak Shah declared independence from the Delhi Sultanate in 1338 CE, establishing the Bengal Sultanate. Under subsequent Ilyas Shahi and Hussain Shahi dynasties, Bengal became a prosperous and culturally vibrant Islamic kingdom. Its capital Gaur (Lakhnauti) became a major centre of Islamic scholarship and trade.',
    location: 'Gaur (Lakhnauti), West Bengal',
    year_ce: 1338, year_hijri: 739,
    tags: ['sultanate', 'political', 'independence', 'gaur'],
    source_url: 'https://en.wikipedia.org/wiki/Bengal_Sultanate',
    created_at: '2025-01-03T00:00:00Z'
  },
  {
    id: 4, category: 'Movement', era: 'Colonial Period',
    title: 'The Faraizi Movement (Founded 1818)',
    excerpt: 'Islamic reform movement founded by Haji Shariatullah calling Muslims to Quranic basics.',
    description: 'Founded by Haji Shariatullah (1781–1840) after returning from Mecca, the Faraizi Movement called Bengali Muslims to observe the fara\'id (obligatory duties of Islam) and abandon un-Islamic practices. It also became a vehicle for resisting British colonial exploitation and Hindu zamindari oppression of Muslim peasant farmers.',
    location: 'Faridpur, Bengal',
    year_ce: 1818, year_hijri: 1233,
    tags: ['reform', 'movement', 'colonial', 'shariatullah', 'faraizi'],
    source_url: 'https://en.wikipedia.org/wiki/Faraizi_movement',
    created_at: '2025-01-04T00:00:00Z'
  },
  {
    id: 5, category: 'Manuscript', era: 'Bengal Sultanate',
    title: 'Rasul Vijay — Early Islamic Bengali Literature',
    excerpt: 'A 15th-century Bengali poem narrating the life of Prophet Muhammad ﷺ.',
    description: 'Shah Muhammad Sagir\'s Yusuf-Zulaikha (c.14th–15th century) and similar works represent the early tradition of Islamic Bengali literature — blending Persian themes with the Bengali language. These manuscripts demonstrate how Muslim writers enriched the Bengali literary tradition.',
    location: 'Bengal',
    year_ce: 1400, year_hijri: 803,
    tags: ['manuscript', 'literature', 'bengali', 'poetry'],
    source_url: 'https://en.wikipedia.org/wiki/Bengali_Muslim_literature',
    created_at: '2025-01-05T00:00:00Z'
  },
  {
    id: 6, category: 'Architecture', era: 'Mughal Period',
    title: 'Lalbagh Fort (Qila Aurangabad), Dhaka',
    excerpt: 'Mughal-era fort complex in Dhaka featuring a mosque and the tomb of Bibi Pari.',
    description: 'Construction of Lalbagh Fort began in 1678 CE under Prince Muhammad Azam Shah, son of Emperor Aurangzeb. It features the Mosque of Sharesta Khan, the tomb of Bibi Pari (daughter-in-law of Aurangzeb), and the Diwan-i-Aam. It is one of the most important Mughal monuments in Bangladesh.',
    location: 'Dhaka, Bangladesh',
    year_ce: 1678, year_hijri: 1089,
    tags: ['mughal', 'architecture', 'dhaka', 'fort', 'mosque'],
    source_url: 'https://en.wikipedia.org/wiki/Lalbagh_Fort',
    created_at: '2025-01-06T00:00:00Z'
  }
];

let nextId = 7; // Auto-increment counter


/* ══════════════════════════════════════════════════════════
 * GET /api/entries — Search, filter, sort, paginate
 * Query params: q, category, era, page, limit, sort
 * ══════════════════════════════════════════════════════════ */
router.get('/', (req, res) => {
  let results = [...entries];

  /* Full-text search across title, description, tags */
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    results = results.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.excerpt.toLowerCase().includes(q) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  /* Filter by category */
  if (req.query.category) {
    results = results.filter(e =>
      e.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  /* Filter by era */
  if (req.query.era) {
    results = results.filter(e =>
      e.era.toLowerCase().includes(req.query.era.toLowerCase())
    );
  }

  /* Sort */
  const [sortField, sortDir] = (req.query.sort || 'created_at:desc').split(':');
  results.sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    const cmp  = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sortDir === 'desc' ? -cmp : cmp;
  });

  /* Pagination */
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(50, parseInt(req.query.limit || '12', 10));
  const total = results.length;
  const pages = Math.ceil(total / limit);
  const data  = results.slice((page - 1) * limit, page * limit);

  res.json({
    entries:    data,
    pagination: { page, limit, total, pages }
  });
});


/* ══════════════════════════════════════════════════════════
 * GET /api/entries/:id — Single entry
 * ══════════════════════════════════════════════════════════ */
router.get('/:id', (req, res) => {
  const entry = entries.find(e => e.id === parseInt(req.params.id, 10));
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  res.json(entry);
});


/* ══════════════════════════════════════════════════════════
 * POST /api/entries — Create new entry
 * Body: { category, era, title, excerpt, description, ... }
 * ══════════════════════════════════════════════════════════ */
router.post('/', (req, res) => {
  const { category, era, title, excerpt, description } = req.body;

  /* Basic validation */
  if (!category || !title || !description) {
    return res.status(400).json({ error: 'category, title, and description are required' });
  }

  const newEntry = {
    id:          nextId++,
    category:    String(category),
    era:         String(era || ''),
    title:       String(title),
    excerpt:     String(excerpt || description.slice(0, 150) + '…'),
    description: String(description),
    location:    String(req.body.location || ''),
    year_ce:     parseInt(req.body.year_ce, 10) || null,
    year_hijri:  parseInt(req.body.year_hijri, 10) || null,
    tags:        Array.isArray(req.body.tags) ? req.body.tags : [],
    source_url:  String(req.body.source_url || ''),
    created_at:  new Date().toISOString()
  };

  entries.push(newEntry);
  res.status(201).json(newEntry);
});


/* ══════════════════════════════════════════════════════════
 * PUT /api/entries/:id — Update entry
 * ══════════════════════════════════════════════════════════ */
router.put('/:id', (req, res) => {
  const idx = entries.findIndex(e => e.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'Entry not found' });

  /* Merge existing entry with updates */
  entries[idx] = {
    ...entries[idx],
    ...req.body,
    id:         entries[idx].id,  // Prevent ID changes
    created_at: entries[idx].created_at,  // Prevent creation date changes
    updated_at: new Date().toISOString()
  };

  res.json(entries[idx]);
});


/* ══════════════════════════════════════════════════════════
 * DELETE /api/entries/:id
 * ══════════════════════════════════════════════════════════ */
router.delete('/:id', (req, res) => {
  const idx = entries.findIndex(e => e.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'Entry not found' });

  entries.splice(idx, 1);
  res.json({ success: true, message: 'Entry deleted' });
});


module.exports = router;

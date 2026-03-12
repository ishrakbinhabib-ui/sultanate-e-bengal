-- ╔══════════════════════════════════════════════════════════╗
-- ║  schema.sql — Bengal Islamic Heritage Superdatabase      ║
-- ║  Compatible with: SQLite, PostgreSQL, MySQL              ║
-- ║  Run: sqlite3 bengal_islamic.db < schema.sql             ║
-- ║       psql -U user -d bengal_islamic -f schema.sql       ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────
-- 1. ENTRIES TABLE
--    Core table for all database records: mosques, scholars,
--    events, manuscripts, movements, cultural artefacts.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entries (
  id            INTEGER       PRIMARY KEY AUTOINCREMENT,
  category      VARCHAR(60)   NOT NULL,     -- 'Mosque', 'Scholar', 'Event', etc.
  era           VARCHAR(80),                -- 'Bengal Sultanate', 'Mughal Period', etc.
  title         VARCHAR(255)  NOT NULL,
  excerpt       TEXT,                       -- Short summary (150 chars)
  description   TEXT          NOT NULL,     -- Full description
  location      VARCHAR(150),               -- Place name
  latitude      DECIMAL(10,7),              -- GPS coordinates (optional)
  longitude     DECIMAL(10,7),
  year_ce       INTEGER,                    -- CE year (can be approximate)
  year_hijri    INTEGER,                    -- Hijri year
  year_approx   BOOLEAN       DEFAULT FALSE,-- Is the year approximate?
  source_url    TEXT,                       -- Primary source URL
  image_url     TEXT,                       -- Featured image
  is_featured   BOOLEAN       DEFAULT FALSE,-- Show on homepage
  is_verified   BOOLEAN       DEFAULT FALSE,-- Scholar-verified content
  view_count    INTEGER       DEFAULT 0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 2. ENTRY TAGS
--    Many-to-many: entries ↔ tags via join table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id         INTEGER     PRIMARY KEY AUTOINCREMENT,
  name       VARCHAR(60) NOT NULL UNIQUE,
  slug       VARCHAR(60) NOT NULL UNIQUE,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entry_tags (
  entry_id   INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. SCHOLARS / FIGURES
--    Detailed profiles for key Islamic figures of Bengal
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholars (
  id              INTEGER      PRIMARY KEY AUTOINCREMENT,
  entry_id        INTEGER      REFERENCES entries(id),  -- Links to main entry
  full_name       VARCHAR(255) NOT NULL,
  arabic_name     VARCHAR(255),
  title           VARCHAR(100),        -- e.g., 'Sultan', 'Sufi Saint', 'Reformer'
  birth_year_ce   INTEGER,
  death_year_ce   INTEGER,
  birth_place     VARCHAR(150),
  sufi_order      VARCHAR(100),        -- e.g., 'Suhrawardiyya', 'Qadiriyya'
  teachers        TEXT,                -- JSON array of teacher names
  students        TEXT,                -- JSON array of student names
  major_works     TEXT,                -- JSON array of book titles
  biography       TEXT,
  legacy          TEXT,
  shrine_location VARCHAR(150),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 4. BOOKS / RESOURCES LIBRARY
--    Curated Islamic book catalogue
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id              INTEGER      PRIMARY KEY AUTOINCREMENT,
  title           VARCHAR(255) NOT NULL,
  title_arabic    VARCHAR(255),
  author_name     VARCHAR(255) NOT NULL,
  author_arabic   VARCHAR(255),
  category        VARCHAR(80)  NOT NULL,  -- 'Tafsir', 'Hadith', 'Fiqh', 'Seerah', 'History'
  subcategory     VARCHAR(80),
  language        VARCHAR(40)  DEFAULT 'English',
  year_published  INTEGER,
  edition         VARCHAR(50),
  publisher       VARCHAR(150),
  description     TEXT         NOT NULL,
  table_of_contents TEXT,                -- JSON array of chapter titles
  key_topics      TEXT,                  -- JSON array of topics covered
  url_free        TEXT,                  -- Free online version URL
  url_purchase    TEXT,                  -- Purchase link
  url_pdf         TEXT,                  -- Direct PDF link (if legally available)
  is_classic      BOOLEAN      DEFAULT FALSE,
  is_recommended  BOOLEAN      DEFAULT FALSE,
  difficulty      VARCHAR(20)  CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  rating          DECIMAL(3,2) DEFAULT 0.00, -- Community rating out of 5
  rating_count    INTEGER      DEFAULT 0,
  cover_image_url TEXT,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 5. MOSQUES & ISLAMIC SITES
--    Detailed data for mosques, shrines, madrasas in Bengal
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id              INTEGER      PRIMARY KEY AUTOINCREMENT,
  entry_id        INTEGER      REFERENCES entries(id),
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(60),            -- 'Mosque', 'Shrine', 'Madrasa', 'Fort'
  built_by        VARCHAR(150),
  year_built_ce   INTEGER,
  dynasty         VARCHAR(100),
  architectural_style VARCHAR(100),
  status          VARCHAR(60),            -- 'Active', 'Ruins', 'Heritage Site'
  is_unesco       BOOLEAN      DEFAULT FALSE,
  is_open_public  BOOLEAN      DEFAULT TRUE,
  address         TEXT,
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  opening_hours   VARCHAR(200),
  admission_fee   VARCHAR(100),
  website         TEXT,
  images          TEXT,                   -- JSON array of image URLs
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 6. ISLAMIC EVENTS / TIMELINE
--    Historical events with precise dating
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id              INTEGER      PRIMARY KEY AUTOINCREMENT,
  entry_id        INTEGER      REFERENCES entries(id),
  event_type      VARCHAR(60),            -- 'Political', 'Religious', 'Cultural', 'Military'
  title           VARCHAR(255) NOT NULL,
  summary         TEXT         NOT NULL,
  date_ce         DATE,
  date_hijri      VARCHAR(30),
  is_date_approx  BOOLEAN      DEFAULT FALSE,
  significance    TEXT,                   -- Why this matters historically
  participants    TEXT,                   -- JSON: [{name, role}]
  outcome         TEXT,
  sources         TEXT,                   -- JSON array of source URLs/references
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 7. MANUSCRIPTS
--    Bengal Islamic manuscript catalogue
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manuscripts (
  id              INTEGER      PRIMARY KEY AUTOINCREMENT,
  entry_id        INTEGER      REFERENCES entries(id),
  title           VARCHAR(255) NOT NULL,
  title_original  VARCHAR(255),           -- Original language title
  author          VARCHAR(255),
  scribe          VARCHAR(255),
  language        VARCHAR(60),            -- 'Arabic', 'Persian', 'Bengali', 'Sanskrit'
  script          VARCHAR(60),            -- 'Naskh', 'Nastaliq', 'Bengali script'
  date_composed   VARCHAR(60),            -- CE or approximate
  date_copied     VARCHAR(60),
  subject_matter  VARCHAR(150),
  holding_library VARCHAR(200),           -- Where it is currently held
  catalogue_ref   VARCHAR(100),
  condition       VARCHAR(60),            -- 'Good', 'Fair', 'Fragile', 'Digitised'
  digital_url     TEXT,                   -- Link to digital copy
  description     TEXT,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 8. QURAN VERSES (Reference table for chatbot & content)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quran_verses (
  id           INTEGER     PRIMARY KEY AUTOINCREMENT,
  surah_number INTEGER     NOT NULL,
  surah_name   VARCHAR(60) NOT NULL,
  ayah_number  INTEGER     NOT NULL,
  arabic_text  TEXT        NOT NULL,
  english_trans TEXT       NOT NULL,
  bengali_trans TEXT,
  topic        VARCHAR(100),             -- 'Knowledge', 'Justice', 'Dawah', etc.
  UNIQUE (surah_number, ayah_number)
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES — Optimise search performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_entries_category  ON entries(category);
CREATE INDEX IF NOT EXISTS idx_entries_era       ON entries(era);
CREATE INDEX IF NOT EXISTS idx_entries_year_ce   ON entries(year_ce);
CREATE INDEX IF NOT EXISTS idx_entries_featured  ON entries(is_featured);
CREATE INDEX IF NOT EXISTS idx_books_category    ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_recommended ON books(is_recommended);
CREATE INDEX IF NOT EXISTS idx_sites_type        ON sites(type);
CREATE INDEX IF NOT EXISTS idx_events_type       ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_scholars_entry    ON scholars(entry_id);

-- Full-text search (SQLite FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
  title, excerpt, description, location,
  content=entries, content_rowid=id
);

-- ─────────────────────────────────────────────────────────────
-- SAMPLE DATA — Seed the database with initial records
-- ─────────────────────────────────────────────────────────────

-- Categories reference (not a table — documented here for clarity)
-- Valid categories: Mosque, Scholar, Historical Event, Movement,
--                  Manuscript, Architecture, Sufi Order, Dynasty,
--                  Cultural Practice, Educational Institution

-- Sample entries
INSERT OR IGNORE INTO entries (id, category, era, title, excerpt, description, location, year_ce, year_hijri, source_url, is_featured, is_verified)
VALUES
(1, 'Mosque', 'Bengal Sultanate',
 'Sixty Dome Mosque (Shat Gambuj Masjid)',
 'UNESCO World Heritage Site — the largest medieval mosque in Bangladesh.',
 'Built c.1459 CE in Bagerhat by Khan Jahan Ali. Features 77 domes and 60 stone pillars.',
 'Bagerhat, Bangladesh', 1459, 863,
 'https://whc.unesco.org/en/list/321', 1, 1),

(2, 'Scholar', 'Medieval Bengal',
 'Shah Jalal of Sylhet', 'The most venerated Sufi saint of Bengal.',
 'Shah Jalal (c.1271–1346 CE) was a Sufi missionary who spread Islam across northeastern Bengal with 360 companions.',
 'Sylhet, Bangladesh', 1303, 703,
 'https://en.wikipedia.org/wiki/Shah_Jalal', 1, 1),

(3, 'Historical Event', 'Bengal Sultanate',
 'Establishment of Bengal Sultanate (1338)',
 'The independent Bengal Sultanate established with Gaur as capital.',
 'Fakhruddin Mubarak Shah declared independence from Delhi Sultanate in 1338 CE.',
 'Gaur, West Bengal', 1338, 739,
 'https://en.wikipedia.org/wiki/Bengal_Sultanate', 1, 1);

-- Sample books
INSERT OR IGNORE INTO books (title, author_name, category, language, description, url_free, is_classic, is_recommended, difficulty)
VALUES
('Riyadh al-Salihin', 'Imam Yahya ibn Sharaf al-Nawawi', 'Hadith', 'English',
 'Gardens of the Righteous — comprehensive hadith compilation on Islamic ethics and worship.',
 'https://sunnah.com/riyadussalihin', 1, 1, 'Beginner'),

('Tafsir Ibn Kathir', 'Imam Ibn Kathir', 'Tafsir', 'English',
 'Most widely used classical Quranic commentary, explaining verses with hadith and scholarly opinions.',
 'https://quran.com', 1, 1, 'Intermediate'),

('The Sealed Nectar (Al-Raheeq Al-Makhtoom)', 'Sheikh Safi-ur-Rahman al-Mubarakpuri', 'Seerah', 'English',
 'Award-winning biography of Prophet Muhammad ﷺ — comprehensive and beautifully written.',
 'https://islamhouse.com', 1, 1, 'Beginner');

-- Sample tags
INSERT OR IGNORE INTO tags (name, slug) VALUES
('Architecture', 'architecture'), ('Sufi', 'sufi'), ('Scholarship', 'scholarship'),
('Reform', 'reform'), ('UNESCO', 'unesco'), ('Mosque', 'mosque'),
('Medieval', 'medieval'), ('Mughal', 'mughal'), ('Sultanate', 'sultanate');

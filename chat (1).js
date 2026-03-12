# ╔══════════════════════════════════════════════════════════╗
# ║  .env.example — Environment Variables Template           ║
# ║  COPY this file to .env and fill in your values.        ║
# ║  NEVER commit .env to version control.                   ║
# ╚══════════════════════════════════════════════════════════╝

# ── SERVER ──────────────────────────────────────────────────
PORT=3001
NODE_ENV=development        # development | production

# ── ANTHROPIC API ────────────────────────────────────────────
# Get your key from: https://console.anthropic.com/
# REQUIRED for the AI chatbot to work.
ANTHROPIC_API_KEY=sk-ant-your-key-here

# ── FRONTEND URL (for CORS in production) ────────────────────
FRONTEND_URL=https://your-domain.com

# ── DATABASE ─────────────────────────────────────────────────
# For SQLite (default, no setup required):
DB_TYPE=sqlite
DB_PATH=./database/bengal_islamic.db

# For PostgreSQL (production recommended):
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=bengal_islamic
# DB_USER=your_db_user
# DB_PASS=your_db_password

---
id: S0
nomi: Poydevor
status: jarayonda
boshlanish: 2026-10-15
tugash: 2026-10-22
davomiylik: 1 hafta
---

# Sprint 0 — Poydevor

## Maqsad
Barcha keyingi modullar quriladigan texnik asosni tayyorlash: monorepo, ma'lumotlar bazasi, UI qobig'i va Claude CLI orqali AI chaqiruvlarini bajaradigan runner.

## Vazifalar

### Monorepo va infratuzilma
- [x] **S0-01** pnpm workspaces + Turborepo monorepo (`apps/web`, `apps/server`, `apps/bot`, `packages/*`)
- [x] **S0-02** TypeScript, ESLint, Prettier umumiy konfiguratsiyasi
- [x] **S0-03** `.env` boshqaruvi va konfiguratsiya moduli (Zod bilan validatsiya)
- [x] **S0-04** Git repo, `.gitignore`, `pnpm dev` bilan barcha ilovalarni bir vaqtda ishga tushirish — izoh: git commit hali qilinmagan, foydalanuvchi qaroriga qoldirildi

### Ma'lumotlar bazasi
- [x] **S0-05** `packages/db`: SQLite + Drizzle ORM, migratsiyalar
- [x] **S0-06** Bazaviy jadvallar: `settings`, `jobs`, `job_events`

### Backend
- [x] **S0-07** `apps/server`: Hono server, healthcheck, xatolarni ishlash
- [x] **S0-08** SQLite asosidagi job navbati (concurrency limiti, retry, bekor qilish)

### Claude runner
- [x] **S0-09** `claude -p --output-format stream-json` jarayonini ishga tushiruvchi runner
- [x] **S0-10** Stream-json parser va SSE orqali brauzerga jonli uzatish — izoh: SSE brauzerda tekshirildi; haqiqiy Claude tool_use/tool_result parse qilinishi hali ko'rilmagan (auth)
- [x] **S0-11** Vazifa turiga qarab `--mcp-config` va `--allowedTools` profillari
- [x] **S0-12** `packages/mcp`: dashboard-mcp server skeleti (`ping` tool'i bilan)

### Frontend
- [x] **S0-13** `apps/web`: Vite + React 19 + TanStack Router/Query
- [x] **S0-14** Tailwind + shadcn/ui, sidebar, dark/light mavzu
- [x] **S0-15** "AI konsol" sahifasi: prompt yuborish va javobni jonli ko'rish

## Qabul mezonlari (Definition of Done)
- [x] `pnpm dev` bitta buyruq bilan web va serverni ishga tushiradi
- [x] UI'dan yuborilgan prompt Claude CLI orqali bajariladi va javob oqim bo'lib ko'rinadi — izoh: zanjir to'liq ishladi, Claude javobi 401 auth xatosi bo'ldi; jonli oqim echo job bilan tasdiqlandi
- [ ] Claude dashboard-mcp'dagi `ping` tool'ini chaqira oladi — bloker: Claude CLI login (`claude` → `/login`); MCP `connected`, tool ro'yxatida mcp__dashboard__ping bor
- [x] Job bekor qilinsa, CLI jarayoni to'xtaydi — izoh: bekor qilish navbat darajasida sinaldi (echo); Claude jarayoniga SIGTERM→SIGKILL kodi bor, haqiqiy uzun Claude job bilan sinalmagan

## Bog'liqliklar
- Lokal mashinada `claude` CLI o'rnatilgan va login qilingan bo'lishi kerak

## Xavflar
- Claude CLI stream-json formati versiyalar orasida o'zgarishi mumkin → parserni alohida modulda saqlash
- Bloker (2026-10-15): lokal Claude CLI login muddati tugagan (401 OAuth access token has expired) — foydalanuvchi terminalda `claude` → `/login` qilishi kerak. Shu sababli "Claude dashboard-mcp'dagi `ping` tool'ini chaqira oladi" mezoni va S0-10 dagi text_delta/tool_use/tool_result tekshiruvi hali tasdiqlanmagan

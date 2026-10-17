---
id: S0
nomi: Poydevor
status: yakunlangan
boshlanish: 2026-10-15
tugash: 2026-10-17
davomiylik: 1 hafta
---

# Sprint 0 — Poydevor

> Rejadagi tugash sanasi 2026-10-22 edi; haqiqiy yakun 2026-10-17 (5 kun oldin).

## Maqsad
Barcha keyingi modullar quriladigan texnik asosni tayyorlash: monorepo, ma'lumotlar bazasi, UI qobig'i va Claude CLI orqali AI chaqiruvlarini bajaradigan runner.

## Vazifalar

### Monorepo va infratuzilma
- [x] **S0-01** pnpm workspaces + Turborepo monorepo (`apps/web`, `apps/server`, `apps/bot`, `packages/*`)
- [x] **S0-02** TypeScript, ESLint, Prettier umumiy konfiguratsiyasi
- [x] **S0-03** `.env` boshqaruvi va konfiguratsiya moduli (Zod bilan validatsiya)
- [x] **S0-04** Git repo, `.gitignore`, `pnpm dev` bilan barcha ilovalarni bir vaqtda ishga tushirish — izoh: boshlang'ich commit qilindi — `aa65b29` (main), 2026-10-15

### Ma'lumotlar bazasi
- [x] **S0-05** `packages/db`: SQLite + Drizzle ORM, migratsiyalar
- [x] **S0-06** Bazaviy jadvallar: `settings`, `jobs`, `job_events`

### Backend
- [x] **S0-07** `apps/server`: Hono server, healthcheck, xatolarni ishlash
- [x] **S0-08** SQLite asosidagi job navbati (concurrency limiti, retry, bekor qilish)

### Claude runner
- [x] **S0-09** `claude -p --output-format stream-json` jarayonini ishga tushiruvchi runner
- [x] **S0-10** Stream-json parser va SSE orqali brauzerga jonli uzatish — izoh: SSE brauzerda tekshirildi; real Claude bilan tool_use va tool_result parse qilinishi tasdiqlandi (2026-10-17); text_delta oqimi ham tasdiqlandi (qisqa job'da 39 ta text_delta SSE orqali keldi)
- [x] **S0-11** Vazifa turiga qarab `--mcp-config` va `--allowedTools` profillari
- [x] **S0-12** `packages/mcp`: dashboard-mcp server skeleti (`ping` tool'i bilan)

### Frontend
- [x] **S0-13** `apps/web`: Vite + React 19 + TanStack Router/Query
- [x] **S0-14** Tailwind + shadcn/ui, sidebar, dark/light mavzu
- [x] **S0-15** "AI konsol" sahifasi: prompt yuborish va javobni jonli ko'rish

## Qabul mezonlari (Definition of Done)
- [x] `pnpm dev` bitta buyruq bilan web va serverni ishga tushiradi
- [x] UI'dan yuborilgan prompt Claude CLI orqali bajariladi va javob oqim bo'lib ko'rinadi — izoh (2026-10-17): real Claude javobi server API (POST /api/jobs/claude + SSE /events) orqali oqim bo'lib keldi (39 ta text_delta). Brauzerdagi AI konsol sahifasi orqali real Claude bilan alohida qayta sinalmagan, lekin u bir xil endpoint'lardan foydalanadi va SSE oldin brauzerda echo job bilan tasdiqlangan
- [x] Claude dashboard-mcp'dagi `ping` tool'ini chaqira oladi — izoh (2026-10-17): POST /api/jobs/claude orqali tekshirildi; init hodisasida mcpServers dashboard=connected, tools=[mcp__dashboard__ping]; Claude mcp__dashboard__ping ni chaqirdi, tool_result {"pong":true,...}, job succeeded (job 1598b6df…, $0.032, 12.6s)
- [x] Job bekor qilinsa, CLI jarayoni to'xtaydi — izoh: haqiqiy uzun Claude job bilan sinaldi (2026-10-17) — cancel'dan oldin 1 ta `claude -p` jarayoni bor edi, cancel'dan 5s keyin 0 ta; job status cancelled (avval navbat darajasida echo bilan ham sinalgan)

## Bog'liqliklar
- Lokal mashinada `claude` CLI o'rnatilgan va login qilingan bo'lishi kerak

## Xavflar
- Claude CLI stream-json formati versiyalar orasida o'zgarishi mumkin → parserni alohida modulda saqlash
- Bloker (2026-10-15) — yechildi (2026-10-17): lokal Claude CLI login muddati tugagan edi (401 OAuth access token has expired). Login endi ishlayapti (claude 2.1.302, `claude -p` muvaffaqiyatli javob berdi); `ping` mezoni va S0-10 tekshiruvlari tasdiqlandi

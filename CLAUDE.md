# Lokal AI Dashboard

Lokal ishlaydigan shaxsiy dashboard: maqsad/vazifalar tizimi (yil → kun), Google Calendar sinxronizatsiyasi, instrumentlar (taqdimot, karusel, video montaj), Telegram assistent + bilim bazasi, Notion integratsiyasi. AI funksiyalar Claude CLI orqali, integratsiyalar MCP orqali.

## Reja va jarayon

- Sprint rejalari: `sprints/` (format: `sprints/README.md`)
- Qarorlar jurnali: `sprints/QARORLAR.md`
- Dashboard: `jarayon.html` (ma'lumot: `jarayon.data.js`, `node scripts/jarayon-sync.mjs` bilan yig'iladi)

## Hisobotchi agent (majburiy)

`hisobotchi` subagentini quyidagi hollarda chaqir va unga nima qilinganini, qaysi vazifa ID'lariga tegishli ekanini va qabul qilingan qarorlarni (sabablari bilan) aniq yoz:

- vazifa boshlanganda, bajarilganda yoki bloklanganda
- texnik yoki mahsulot qarori qabul qilinganda, ayniqsa rejadan chetlashilganda
- sprint boshlanganda va yakunlanganda (yakunida — hisobot yozdirish)

Sprint fayllarini, `QARORLAR.md` va `jarayon.data.js` ni o'zing qo'lda tahrirlama — buni hisobotchi qiladi.

## Texnologiyalar

Q-001…Q-005 qarorlariga qarang: pnpm monorepo, Vite + React 19, Hono, SQLite + Drizzle, Claude CLI (`stream-json`) + MCP, grammY.

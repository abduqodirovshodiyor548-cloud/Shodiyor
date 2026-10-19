// Avtomatik yaratilgan: node scripts/jarayon-sync.mjs. Qo'lda tahrirlamang.
window.JARAYON = {
  "yangilangan": "2026-10-19T07:06:40.060Z",
  "loyiha": "Lokal AI Dashboard",
  "sprints": [
    {
      "id": "S0",
      "nomi": "Poydevor",
      "status": "yakunlangan",
      "boshlanish": "2026-10-15",
      "tugash": "2026-10-17",
      "davomiylik": "1 hafta",
      "fayl": "sprints/sprint-00-poydevor.md",
      "maqsad": "Barcha keyingi modullar quriladigan texnik asosni tayyorlash: monorepo, ma'lumotlar bazasi, UI qobig'i va Claude CLI orqali AI chaqiruvlarini bajaradigan runner.",
      "dod": [
        {
          "text": "`pnpm dev` bitta buyruq bilan web va serverni ishga tushiradi",
          "done": true
        },
        {
          "text": "UI'dan yuborilgan prompt Claude CLI orqali bajariladi va javob oqim bo'lib ko'rinadi — izoh (2026-10-17): real Claude javobi server API (POST /api/jobs/claude + SSE /events) orqali oqim bo'lib keldi (39 ta text_delta). Brauzerdagi AI konsol sahifasi orqali real Claude bilan alohida qayta sinalmagan, lekin u bir xil endpoint'lardan foydalanadi va SSE oldin brauzerda echo job bilan tasdiqlangan",
          "done": true
        },
        {
          "text": "Claude dashboard-mcp'dagi `ping` tool'ini chaqira oladi — izoh (2026-10-17): POST /api/jobs/claude orqali tekshirildi; init hodisasida mcpServers dashboard=connected, tools=[mcp__dashboard__ping]; Claude mcp__dashboard__ping ni chaqirdi, tool_result {\"pong\":true,...}, job succeeded (job 1598b6df…, $0.032, 12.6s)",
          "done": true
        },
        {
          "text": "Job bekor qilinsa, CLI jarayoni to'xtaydi — izoh: haqiqiy uzun Claude job bilan sinaldi (2026-10-17) — cancel'dan oldin 1 ta `claude -p` jarayoni bor edi, cancel'dan 5s keyin 0 ta; job status cancelled (avval navbat darajasida echo bilan ham sinalgan)",
          "done": true
        }
      ],
      "tasks": [
        {
          "id": "S0-01",
          "title": "pnpm workspaces + Turborepo monorepo (`apps/web`, `apps/server`, `apps/bot`, `packages/*`)",
          "group": "Monorepo va infratuzilma",
          "status": "bajarildi"
        },
        {
          "id": "S0-02",
          "title": "TypeScript, ESLint, Prettier umumiy konfiguratsiyasi",
          "group": "Monorepo va infratuzilma",
          "status": "bajarildi"
        },
        {
          "id": "S0-03",
          "title": "`.env` boshqaruvi va konfiguratsiya moduli (Zod bilan validatsiya)",
          "group": "Monorepo va infratuzilma",
          "status": "bajarildi"
        },
        {
          "id": "S0-04",
          "title": "Git repo, `.gitignore`, `pnpm dev` bilan barcha ilovalarni bir vaqtda ishga tushirish — izoh: boshlang'ich commit qilindi — `aa65b29` (main), 2026-10-15",
          "group": "Monorepo va infratuzilma",
          "status": "bajarildi"
        },
        {
          "id": "S0-05",
          "title": "`packages/db`: SQLite + Drizzle ORM, migratsiyalar",
          "group": "Ma'lumotlar bazasi",
          "status": "bajarildi"
        },
        {
          "id": "S0-06",
          "title": "Bazaviy jadvallar: `settings`, `jobs`, `job_events`",
          "group": "Ma'lumotlar bazasi",
          "status": "bajarildi"
        },
        {
          "id": "S0-07",
          "title": "`apps/server`: Hono server, healthcheck, xatolarni ishlash",
          "group": "Backend",
          "status": "bajarildi"
        },
        {
          "id": "S0-08",
          "title": "SQLite asosidagi job navbati (concurrency limiti, retry, bekor qilish)",
          "group": "Backend",
          "status": "bajarildi"
        },
        {
          "id": "S0-09",
          "title": "`claude -p --output-format stream-json` jarayonini ishga tushiruvchi runner",
          "group": "Claude runner",
          "status": "bajarildi"
        },
        {
          "id": "S0-10",
          "title": "Stream-json parser va SSE orqali brauzerga jonli uzatish — izoh: SSE brauzerda tekshirildi; real Claude bilan tool_use va tool_result parse qilinishi tasdiqlandi (2026-10-17); text_delta oqimi ham tasdiqlandi (qisqa job'da 39 ta text_delta SSE orqali keldi)",
          "group": "Claude runner",
          "status": "bajarildi"
        },
        {
          "id": "S0-11",
          "title": "Vazifa turiga qarab `--mcp-config` va `--allowedTools` profillari",
          "group": "Claude runner",
          "status": "bajarildi"
        },
        {
          "id": "S0-12",
          "title": "`packages/mcp`: dashboard-mcp server skeleti (`ping` tool'i bilan)",
          "group": "Claude runner",
          "status": "bajarildi"
        },
        {
          "id": "S0-13",
          "title": "`apps/web`: Vite + React 19 + TanStack Router/Query",
          "group": "Frontend",
          "status": "bajarildi"
        },
        {
          "id": "S0-14",
          "title": "Tailwind + shadcn/ui, sidebar, dark/light mavzu",
          "group": "Frontend",
          "status": "bajarildi"
        },
        {
          "id": "S0-15",
          "title": "\"AI konsol\" sahifasi: prompt yuborish va javobni jonli ko'rish",
          "group": "Frontend",
          "status": "bajarildi"
        }
      ]
    },
    {
      "id": "S1",
      "nomi": "Maqsadlar va vazifalar tizimi",
      "status": "jarayonda",
      "boshlanish": "2026-10-17",
      "tugash": "2026-10-30",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-01-maqsadlar.md",
      "maqsad": "Yillik → kvartal → oylik → haftalik → kunlik darajadagi maqsad va vazifalar tizimini qo'lda to'liq boshqarish imkoniyati. Claude bu ma'lumotlar bilan MCP orqali ishlay oladi.",
      "dod": [
        {
          "text": "Yillik maqsaddan kunlik vazifagacha bo'lgan zanjirni yaratish va ko'rish mumkin",
          "done": null
        },
        {
          "text": "Vazifa bajarilganda yuqori darajadagi progress avtomatik yangilanadi",
          "done": null
        },
        {
          "text": "Claude AI konsoldan \"bu haftaning vazifalarini ko'rsat\" so'roviga MCP orqali javob beradi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S1-01",
          "title": "Jadvallar: `goals` (daraja, ota maqsad, davr), `key_results`, `tasks`, `tags` — migratsiya `packages/db/drizzle/0001_s1_goals_tasks.sql`, 15 sinov o'tdi (default, UUID, CHECK, FK, kaskad/set null, updated_at); typecheck/lint/prettier toza. Qarorlar: Q-022…Q-026",
          "group": "Ma'lumot modeli",
          "status": "bajarildi"
        },
        {
          "id": "S1-02",
          "title": "Davr mantiqi: yil/kvartal/oy/hafta/kun chegaralari (ISO hafta) — `packages/shared/src/period.ts` va `period.test.ts`. Tekshirildi: `pnpm --filter @loiha/shared test` 15/15 sinov (9 suite) o'tdi; `pnpm typecheck` 7/7 muvaffaqiyatli; ESLint `._*` fayllarsiz 0 xato; Prettier manba fayllar toza. Qarorlar: Q-027…Q-029",
          "group": "Ma'lumot modeli",
          "status": "bajarildi"
        },
        {
          "id": "S1-03",
          "title": "Progress hisoblash: vazifalardan key result'ga, undan maqsadlarga yuqoriga yig'ilish — formulalar `packages/shared/src/progress.ts`, kesh yangilash `packages/db/src/progress.ts` (recomputeKeyResult/GoalUpwards/FromKeyResult/ForTask/AllProgress, sikllardan himoyalangan). Tekshirildi: shared 26/26, db 5/5 sinov; typecheck 7/7; lint 0 xato; format toza. Eslatma: S1-05 va S1-12 har yozishdan keyin `recompute*` ni chaqirishi shart. Qarorlar: Q-030…Q-032",
          "group": "Ma'lumot modeli",
          "status": "bajarildi"
        },
        {
          "id": "S1-04",
          "title": "Takrorlanuvchi vazifalar (kunlik, haftalik, maxsus qoida) — `packages/shared/src/recurrence.ts` (recurrenceRuleSchema/recurrenceSchema, occursOn, occurrencesBetween, describeRecurrence), `packages/db/src/recurrence.ts` (materializeRecurrences, resetFutureOccurrences), yangi `task_recurrences` jadvali, `tasks.recurrence_id` + `occurrence_date`, migratsiya `0002_s1_task_recurrences.sql` (ON DELETE set null qo'lda qo'shildi), server ishga tushganda va har soat generatsiya. Tekshirildi: shared 37/37, db 11/11 sinov; typecheck 7/7; lint 0 xato; format toza. Server real ishga tushirib sinalmagan. Eslatma: S1-05 seriya yaratish/o'zgartirishda `resetFutureOccurrences` + `materializeRecurrences` ni chaqirishi shart; S1-12 da `describeRecurrence` ishlatilishi mumkin. Qarorlar: Q-033…Q-036",
          "group": "Ma'lumot modeli",
          "status": "bajarildi"
        },
        {
          "id": "S1-05",
          "title": "Maqsad, key result va vazifalar uchun CRUD endpoint'lar — `/api/goals`, `/api/key-results`, `/api/tasks`, `/api/recurrences`, `/api/tags` (`apps/server/src/routes/planning.ts`); mantiq servis qatlamida `packages/db/src/planning.ts` (`PlanningError` → 404/400/409), zod sxemalari va DTO `packages/shared/src/planning.ts`. Har yozish `recompute*` bilan (Q-031). Tekshirildi: shared 37/37, db 25/25 sinov; typecheck 7/7; lint 0; format toza; server real ishga tushirilib curl bilan sinaldi (yil→kvartal→KR→vazifa zanjiri, progress 0.5 yuqoriga yetdi, 400/404/409/204, haftalik seriya 6 vazifa). Qarorlar: Q-037…Q-042",
          "group": "API",
          "status": "bajarildi"
        },
        {
          "id": "S1-06",
          "title": "Davr bo'yicha filtr va daraxt ko'rinishidagi so'rovlar — `GET /api/goals`, `/api/goals/tree`, `/api/tasks` ga `period` kaliti (2026, 2026-Q4, 2026-10, 2026-W43, 2026-10-19) yoki `from`/`to`, `status`/`level`/`planLevel` (vergul bilan ko'p qiymat), `unplanned=true` (inbox). `getGoalTree` (KR, taskCounts, ixtiyoriy vazifalar) `packages/db/src/planning.ts` da; zod sxemalari, `periodRange()` va `GoalTreeNode` `packages/shared/src/planning.ts` da. Tekshirildi: shared 37/37, db 35/35 (10 ta yangi: `planning-queries.test.ts`); typecheck 7/7; lint 0; format toza; server vaqtinchalik bazada real sinaldi (W43 kunlik+oylik reja chiqdi, kelasi hafta chiqmadi; daraxt 2026 → Q4 → W43; noto'g'ri kalit 400). Qarorlar: Q-043…Q-046",
          "group": "API",
          "status": "bajarildi"
        },
        {
          "id": "S1-07",
          "title": "Yillik va kvartal ko'rinishi (maqsadlar xaritasi) — `apps/web/src/routes/goals/` (`GoalsPage`, `GoalCard`, `GoalSheet`, `labels.ts`), `apps/web/src/lib/planning.ts`; `/maqsadlar` (`view=yil|kvartal`, `period`), davr navigatsiyasi, yil: yillik maqsadlar + 4 kvartal ustuni, kvartal: maqsadlar + 3 oy ustuni; o'ng panelda maqsad/KR yaratish, tahrirlash, o'chirish. Tekshirildi: typecheck 7/7, lint 0, format toza; brauzerda alohida test bazasi bilan sinaldi (progress yangilanishi, KR inline tahriri, yaratish/o'chirish, 375px va qorong'i rejim, konsolda xato yo'q). Qarorlar: Q-047…Q-050",
          "group": "UI",
          "status": "bajarildi"
        },
        {
          "id": "S1-08",
          "title": "Oylik va haftalik ko'rinish (kanban + ro'yxat)",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-09",
          "title": "Kunlik ko'rinish: \"Bugun\" sahifasi, fokus ro'yxati",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-10",
          "title": "Drag-and-drop bilan vazifani kun/haftaga ko'chirish (dnd-kit)",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-11",
          "title": "Ustuvorlik, teglar, qidiruv va tezkor qo'shish (Cmd+K)",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-12",
          "title": "dashboard-mcp tool'lari: `list_goals`, `get_goal_tree`, `create_task`, `update_task`, `update_progress`",
          "group": "MCP",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S2",
      "nomi": "AI rejalashtirish va kalendar",
      "status": "rejalashtirilgan",
      "boshlanish": "2026-11-09",
      "tugash": "2026-11-20",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-02-kalendar.md",
      "maqsad": "Claude maqsadlarni kichik qadamlarga bo'lib, kun va haftani rejalashtiradi. Reja Google Calendar bilan ikki tomonlama sinxron bo'ladi.",
      "dod": [
        {
          "text": "\"Bugungi reja\" tugmasi bilan Claude kunni rejalashtiradi va bloklar kalendarda paydo bo'ladi",
          "done": null
        },
        {
          "text": "Google Calendar'da event surilsa, dashboard'da vazifa vaqti ham yangilanadi",
          "done": null
        },
        {
          "text": "Ikki tomonlama o'zgarishda dublikat event yaratilmaydi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S2-01",
          "title": "\"Maqsadni bo'lish\": yillik maqsaddan kvartal, oy va hafta darajasigacha taklif",
          "group": "AI rejalashtirish",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-02",
          "title": "\"Bugungi reja\": vazifalar, kalendar bandligi va ustuvorlik asosida kun rejasi",
          "group": "AI rejalashtirish",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-03",
          "title": "Haftalik review: nima bajarildi, nima ko'chiriladi, xulosa",
          "group": "AI rejalashtirish",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-04",
          "title": "AI takliflarini qabul qilish/rad etish UI'i (diff ko'rinishida)",
          "group": "AI rejalashtirish",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-05",
          "title": "Google OAuth (lokal redirect), tokenlarni xavfsiz saqlash",
          "group": "Google Calendar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-06",
          "title": "Kalendar event'larini o'qish va UI'da ko'rsatish (FullCalendar)",
          "group": "Google Calendar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-07",
          "title": "Vaqt bloki berilgan vazifa → kalendar event'i (eventId mapping)",
          "group": "Google Calendar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-08",
          "title": "Kalendardagi o'zgarishlarni qaytarib olish (syncToken, 5 daqiqalik polling)",
          "group": "Google Calendar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-09",
          "title": "Konfliktlarni hal qilish qoidalari va sinxronizatsiya logi",
          "group": "Google Calendar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S2-10",
          "title": "Claude uchun kalendar tool'lari (Google Calendar MCP ulash yoki o'zimizniki)",
          "group": "MCP",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S3",
      "nomi": "Bilim bazasi va Notion",
      "status": "rejalashtirilgan",
      "boshlanish": "2026-11-23",
      "tugash": "2026-12-04",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-03-bilim-bazasi-notion.md",
      "maqsad": "Shaxsiy bilim bazasi (hujjatlar, eslatmalar, Notion sahifalari) va Notion bilan ikki tomonlama ishlash. Claude bilim bazasidan qidirib javob bera oladi.",
      "dod": [
        {
          "text": "PDF yoki URL qo'shilgandan keyin AI konsolda u haqida savol berilsa, manbasi bilan javob qaytadi",
          "done": null
        },
        {
          "text": "Dashboard'dagi vazifa Notion DB'da ko'rinadi va aksincha",
          "done": null
        },
        {
          "text": "Claude Notion'da yangi sahifa yarata oladi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S3-01",
          "title": "Jadvallar: `kb_documents`, `kb_chunks`, FTS5 indeks",
          "group": "Bilim bazasi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-02",
          "title": "Ingest: Markdown, PDF, URL, oddiy matn → bo'laklarga ajratish",
          "group": "Bilim bazasi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-03",
          "title": "Qidiruv API (FTS5, rank, manba havolasi bilan)",
          "group": "Bilim bazasi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-04",
          "title": "Bilim bazasi UI: hujjatlar ro'yxati, ko'rish, teglar, yuklash",
          "group": "Bilim bazasi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-05",
          "title": "dashboard-mcp: `kb_search`, `kb_get_document`, `kb_add_note` tool'lari",
          "group": "Bilim bazasi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-06",
          "title": "Notion integratsiyasi: token sozlash, ulanishni tekshirish",
          "group": "Notion",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-07",
          "title": "Notion sahifalarini bilim bazasiga import qilish (tanlangan sahifa/DB)",
          "group": "Notion",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-08",
          "title": "Maqsad va vazifalarni Notion database bilan sinxronlash (`@notionhq/client`)",
          "group": "Notion",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-09",
          "title": "Notion MCP'ni Claude profillariga ulash (AI orqali sahifa yaratish/tahrirlash)",
          "group": "Notion",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S3-10",
          "title": "sqlite-vec + lokal embedding (transformers.js) bilan gibrid qidiruv",
          "group": "Semantik qidiruv (ixtiyoriy)",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S4",
      "nomi": "Telegram assistent",
      "status": "rejalashtirilgan",
      "boshlanish": "2026-12-07",
      "tugash": "2026-12-18",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-04-telegram.md",
      "maqsad": "Dashboard'ning mobil interfeysi: Telegram orqali vazifa qo'shish, rejani ko'rish, bilim bazasidan so'rash va Claude bilan erkin muloqot.",
      "dod": [
        {
          "text": "Begona foydalanuvchi bot bilan ishlay olmaydi",
          "done": null
        },
        {
          "text": "Ovozli xabar orqali qo'shilgan vazifa dashboard'da paydo bo'ladi",
          "done": null
        },
        {
          "text": "Har kuni belgilangan vaqtda ertalabki brief keladi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S4-01",
          "title": "`apps/bot`: grammY, long polling, faqat ruxsat etilgan chat ID (whitelist)",
          "group": "Bot asosi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-02",
          "title": "Bot va server o'rtasida ichki API (bitta DB, umumiy servislar)",
          "group": "Bot asosi",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-03",
          "title": "`/today`, `/week`, `/goals` — rejani ko'rish",
          "group": "Buyruqlar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-04",
          "title": "`/add` va inline tugmalar bilan vazifani bajarildi deb belgilash",
          "group": "Buyruqlar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-05",
          "title": "Erkin matn → Claude (dashboard-mcp, kb, kalendar tool'lari bilan)",
          "group": "Buyruqlar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-06",
          "title": "Suhbat konteksti (Claude sessiyasini davom ettirish)",
          "group": "Buyruqlar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-07",
          "title": "Ovozli xabar → whisper.cpp → vazifa yoki eslatma",
          "group": "Ovoz va fayllar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-08",
          "title": "Yuborilgan fayl va havolalarni bilim bazasiga qo'shish",
          "group": "Ovoz va fayllar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-09",
          "title": "Ertalabki brief (kun rejasi, kalendar, ustuvorliklar) — cron",
          "group": "Avtomatik xabarlar",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S4-10",
          "title": "Kechki review va vazifa eslatmalari",
          "group": "Avtomatik xabarlar",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S5",
      "nomi": "Taqdimot yaratuvchi",
      "status": "rejalashtirilgan",
      "boshlanish": "2026-12-21",
      "tugash": "2027-01-01",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-05-taqdimot.md",
      "maqsad": "Mavzu va materialdan tayyor taqdimot (PPTX/PDF) yaratadigan instrument. Claude struktura va matnni yozadi, tizim uni brend dizaynida render qiladi.",
      "dod": [
        {
          "text": "Bitta prompt bilan 8–12 slaydli taqdimot yaratiladi",
          "done": null
        },
        {
          "text": "PPTX PowerPoint/Keynote'da buzilmasdan ochiladi",
          "done": null
        },
        {
          "text": "Slaydni alohida qayta generatsiya qilish mumkin",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S5-01",
          "title": "Slayd JSON sxemasi (sarlavha, bullet, rasm, diagramma, iqtibos, raqamlar)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-02",
          "title": "Claude: mavzu → reja → slayd JSON (bilim bazasidan material bilan)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-03",
          "title": "HTML slayd renderer va mavzular (brend ranglari, shriftlar)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-04",
          "title": "PPTX eksport (pptxgenjs)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-05",
          "title": "PDF eksport (Playwright)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-06",
          "title": "Instrumentlar bo'limi va \"Taqdimot\" sahifasi",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-07",
          "title": "Slayd preview va qo'lda tahrirlash",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-08",
          "title": "Bitta slaydni AI bilan qayta yozish (\"qisqaroq\", \"ko'proq raqam\")",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S5-09",
          "title": "Taqdimotlar tarixi va qayta ochish",
          "group": "UI",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S6",
      "nomi": "Karusel yaratuvchi",
      "status": "rejalashtirilgan",
      "boshlanish": "2027-01-04",
      "tugash": "2027-01-15",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-06-karusel.md",
      "maqsad": "Instagram/LinkedIn uchun karusel postlar (PNG seriyasi) yaratish. Claude g'oya va matnni yozadi, shablonlar orqali rasm sifatida render qilinadi.",
      "dod": [
        {
          "text": "Bitta g'oyadan 3 ta variant chiqadi, tanlangani PNG ZIP sifatida yuklanadi",
          "done": null
        },
        {
          "text": "O'zbek harflari (oʻ, gʻ) shriftlarda to'g'ri chiqadi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S6-01",
          "title": "Karusel JSON sxemasi (hook slayd, kontent slaydlar, CTA)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-02",
          "title": "Brend sozlamalari: ranglar, shriftlar, logo, handle",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-03",
          "title": "JSX shablonlar kutubxonasi (kamida 5 ta)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-04",
          "title": "Satori + resvg bilan PNG render (1080×1350 va 1080×1080)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-05",
          "title": "Claude: g'oya → bir nechta variant (hook, struktura, caption, hashtaglar)",
          "group": "Pipeline",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-06",
          "title": "\"Karusel\" sahifasi: variantlar, preview, slaydni tahrirlash",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-07",
          "title": "ZIP eksport va caption'ni nusxalash",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S6-08",
          "title": "Kontent rejasi: karuselni haftalik vazifa/kalendarga bog'lash",
          "group": "UI",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S7",
      "nomi": "Video montajchi — asos",
      "status": "rejalashtirilgan",
      "boshlanish": "2027-01-18",
      "tugash": "2027-01-29",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-07-video-asos.md",
      "maqsad": "Xom videoni transkripsiya qilish, Claude yordamida kesish rejasini (EDL) tuzish va FFmpeg bilan render qilish.",
      "dod": [
        {
          "text": "10 daqiqalik videodan pauzalar va xatolar olib tashlangan versiya avtomatik chiqadi",
          "done": null
        },
        {
          "text": "Foydalanuvchi transkriptda segmentni qayta tiklay oladi va qayta render qiladi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S7-01",
          "title": "Video yuklash, lokal media papkasi, metadata (ffprobe)",
          "group": "Media",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-02",
          "title": "Preview uchun proxy fayl va thumbnail'lar",
          "group": "Media",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-03",
          "title": "whisper.cpp bilan so'z darajasidagi vaqtli transkripsiya",
          "group": "Media",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-04",
          "title": "EDL JSON sxemasi (segmentlar, olib tashlanadigan joylar, sabablar)",
          "group": "AI montaj",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-05",
          "title": "Claude: transkript → pauza, xato va takrorlarni olib tashlash",
          "group": "AI montaj",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-06",
          "title": "Claude: highlight'larni tanlash (qisqa klip uchun)",
          "group": "AI montaj",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-07",
          "title": "FFmpeg render job'i (progress bilan, fon rejimida)",
          "group": "AI montaj",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-08",
          "title": "Transkript asosidagi tahrir: matnni o'chirish = videodan kesish",
          "group": "UI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S7-09",
          "title": "Timeline preview va render natijasini ko'rish",
          "group": "UI",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S8",
      "nomi": "Video montajchi — kengaytma",
      "status": "rejalashtirilgan",
      "boshlanish": "2027-02-01",
      "tugash": "2027-02-12",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-08-video-kengaytma.md",
      "maqsad": "Montajlangan videoni ijtimoiy tarmoqlar uchun tayyor holga keltirish: subtitrlar, vertikal format, intro/outro, musiqa.",
      "dod": [
        {
          "text": "Xom videodan subtitrli, 9:16 formatdagi reels bitta oqimda chiqadi",
          "done": null
        },
        {
          "text": "Subtitrlar o'zbek tilida to'g'ri vaqtda ko'rinadi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S8-01",
          "title": "Remotion integratsiyasi: subtitr shablonlari (so'zma-so'z animatsiya)",
          "group": "Grafika",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-02",
          "title": "Intro/outro va lower-third shablonlari (brend sozlamalari bilan)",
          "group": "Grafika",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-03",
          "title": "9:16 reels formati: avtomatik crop (markazlash yoki yuzni kuzatish)",
          "group": "Format",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-04",
          "title": "Fon musiqasi, ducking va ovoz balansini avtomatik sozlash",
          "group": "Format",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-05",
          "title": "Bitta videodan bir nechta format eksporti (16:9, 9:16, 1:1)",
          "group": "Format",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-06",
          "title": "Claude: sarlavha, tavsif va hashtaglar generatsiyasi",
          "group": "AI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-07",
          "title": "Uzun videodan bir nechta qisqa klip (shorts) ajratish",
          "group": "AI",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S8-08",
          "title": "EDL'ni Premiere/DaVinci'ga eksport (Filmit MCP orqali)",
          "group": "Integratsiya (ixtiyoriy)",
          "status": "rejalashtirilgan"
        }
      ]
    },
    {
      "id": "S9",
      "nomi": "Sayqal va barqarorlik",
      "status": "rejalashtirilgan",
      "boshlanish": "2027-02-15",
      "tugash": "2027-02-26",
      "davomiylik": "2 hafta",
      "fayl": "sprints/sprint-09-sayqal.md",
      "maqsad": "Ilovani kundalik ishlatish uchun ishonchli qilish: analitika, backup, avtomatik ishga tushish, xatolarni kuzatish.",
      "dod": [
        {
          "text": "Kompyuter qayta yoqilganda server va bot avtomatik ishga tushadi",
          "done": null
        },
        {
          "text": "Backup'dan to'liq tiklash sinab ko'rilgan",
          "done": null
        },
        {
          "text": "Tizim holati sahifasi barcha integratsiyalar holatini ko'rsatadi",
          "done": null
        }
      ],
      "tasks": [
        {
          "id": "S9-01",
          "title": "Maqsadlar bajarilishi, haftalik trend, fokus vaqti grafiklari",
          "group": "Analitika",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-02",
          "title": "Instrumentlardan foydalanish statistikasi (AI job'lar, vaqt)",
          "group": "Analitika",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-03",
          "title": "SQLite avtomatik backup (kunlik, rotatsiya bilan)",
          "group": "Barqarorlik",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-04",
          "title": "macOS launchd: server va botni avtomatik ishga tushirish",
          "group": "Barqarorlik",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-05",
          "title": "Xatolar logi va \"Tizim holati\" sahifasi (CLI, MCP, Google, Notion, bot)",
          "group": "Barqarorlik",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-06",
          "title": "Kritik oqimlar uchun e2e testlar (Playwright)",
          "group": "Barqarorlik",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-07",
          "title": "Sozlamalar sahifasi (integratsiyalar, brend, cron vaqtlari)",
          "group": "UX",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-08",
          "title": "Onboarding: birinchi ishga tushirishda integratsiyalarni ulash ustasi",
          "group": "UX",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S9-09",
          "title": "Ishlash tezligi va UI sayqali",
          "group": "UX",
          "status": "rejalashtirilgan"
        }
      ]
    }
  ],
  "qarorlar": [
    {
      "id": "Q-001",
      "sarlavha": "Frontend va backend alohida, TypeScript monorepo",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Ilova lokalda ishlaydi va doimiy fon jarayonlari bor (Telegram bot, kalendar sinxronizatsiyasi, Claude CLI jarayonlari).",
      "qaror": "pnpm workspaces + Turborepo. Frontend: Vite + React 19 + TanStack Router/Query + Tailwind + shadcn/ui. Backend: Hono (Node). Next.js tanlanmadi.",
      "oqibat": "Web, server va bot alohida ilovalar bo'ladi, umumiy kod `packages/*` ichida turadi."
    },
    {
      "id": "Q-002",
      "sarlavha": "Ma'lumotlar bazasi — SQLite + Drizzle",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Bir foydalanuvchili lokal ilova, server o'rnatish va boshqarish ortiqcha.",
      "qaror": "SQLite + Drizzle ORM. Qidiruv uchun FTS5, keyinroq sqlite-vec. Job navbati ham SQLite jadvalida (Redis yo'q).",
      "oqibat": "Backup bitta faylni nusxalash bilan bajariladi. Yuqori darajadagi parallel yozish kerak emas."
    },
    {
      "id": "Q-003",
      "sarlavha": "AI funksiyalar Claude CLI orqali, integratsiyalar MCP orqali",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Barcha AI ishlarini to'g'ridan-to'g'ri API emas, lokal Claude CLI bajarishi talab qilingan.",
      "qaror": "Server har bir AI vazifani `claude -p --output-format stream-json` jarayoni sifatida ishga tushiradi. Vazifa turiga qarab `--mcp-config` va `--allowedTools` profili beriladi. Dashboard ma'lumotlari Claude'ga o'zimizning `dashboard-mcp` serveri orqali ochiladi.",
      "oqibat": "Claude CLI o'rnatilgan va login qilingan bo'lishi shart. Parallel AI vazifalar soni cheklanadi."
    },
    {
      "id": "Q-004",
      "sarlavha": "Telegram bot long polling bilan",
      "sana": "2026-10-15",
      "sprint": "S4",
      "status": "qabul qilingan",
      "kontekst": "Lokal ilovada public URL yo'q, webhook ishlatib bo'lmaydi.",
      "qaror": "grammY kutubxonasi, long polling, chat ID bo'yicha whitelist.",
      "oqibat": "Bot faqat kompyuter yoqiq bo'lganda ishlaydi."
    },
    {
      "id": "Q-005",
      "sarlavha": "Kalendar sinxronizatsiyasi polling bilan",
      "sana": "2026-10-15",
      "sprint": "S2",
      "status": "qabul qilingan",
      "kontekst": "Google Calendar push-bildirishnomalari public HTTPS endpoint talab qiladi.",
      "qaror": "Har 5 daqiqada syncToken bilan inkremental polling.",
      "oqibat": "Kalendardagi o'zgarish dashboard'ga 5 daqiqagacha kechikib keladi."
    },
    {
      "id": "Q-006",
      "sarlavha": "pnpm 12.11.2 corepack orqali, native build'lar `allowBuilds` bilan",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Global `/usr/local/bin` ga yozish ruxsati yo'q edi.",
      "qaror": "pnpm 12.11.2 corepack orqali `~/.local/bin` ga o'rnatildi; `package.json` da `packageManager: pnpm@12.11.2`. Native build'lar `pnpm-workspace.yaml` dagi `allowBuilds` bilan ruxsat etiladi (esbuild, better-sqlite3).",
      "oqibat": "pnpm 12 da `onlyBuiltDependencies` ishlamaydi, yangi native paket qo'shilganda `allowBuilds` ga qo'shish kerak. `~/.local/bin` PATH da bo'lishi shart."
    },
    {
      "id": "Q-007",
      "sarlavha": "TypeScript 6.0 ga mahkamlandi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "TypeScript 7.0.2 latest, lekin typescript-eslint 8.71 faqat `<6.1.0` ni qo'llab-quvvatlaydi.",
      "qaror": "TypeScript 6.0 ishlatiladi.",
      "oqibat": "TS 7 ga o'tish typescript-eslint yangilanishini kutadi."
    },
    {
      "id": "Q-008",
      "sarlavha": "Ichki paketlar build qilinmaydi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "`@loiha/*` paketlari faqat monorepo ichida ishlatiladi.",
      "qaror": "`exports` to'g'ridan-to'g'ri `src/index.ts` ga qaraydi; server tsx bilan, web Vite bilan ishlatadi.",
      "oqibat": "Alohida build bosqichi yo'q, faqat typecheck."
    },
    {
      "id": "Q-009",
      "sarlavha": "Standart portlar va DB fayli",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Lokal ishlab chiqish uchun aniq standartlar kerak.",
      "qaror": "Server porti 4310, web 5173; DB fayli `data/dashboard.db` (gitignore qilingan).",
      "oqibat": "Port o'zgarsa `.env` orqali sozlanadi; DB fayli repoga tushmaydi, backup alohida."
    },
    {
      "id": "Q-010",
      "sarlavha": "Migratsiyalar server ishga tushganda avtomatik qo'llanadi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Bir foydalanuvchili lokal ilova, alohida migratsiya bosqichi ortiqcha.",
      "qaror": "`getDb()` birinchi chaqiruvda migratsiyalarni avtomatik qo'llaydi.",
      "oqibat": "Sxema o'zgarsa `pnpm db:generate` bilan migratsiya fayli yaratilib, commit qilinadi."
    },
    {
      "id": "Q-011",
      "sarlavha": "Job hodisalari job_events jadvalida saqlanadi, SSE shundan qayta o'ynatiladi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Brauzer qayta ulanganda yoki sahifa yangilanganda job chiqishi yo'qolmasligi kerak.",
      "qaror": "Claude stream-json xabarlari `job_events` ga yoziladi; SSE shu jadvaldan `seq` bo'yicha qayta o'ynatadi.",
      "oqibat": "Uzun job'lar ko'p qator yozadi — S9 da tozalash siyosati kerak bo'ladi."
    },
    {
      "id": "Q-012",
      "sarlavha": "Claude job ish papkalari loyihadan tashqarida",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Claude CLI cwd va uning ota papkalaridagi CLAUDE.md va .claude sozlamalarini yuklaydi; loyiha ichida bo'lsa job'larga dasturlash yo'riqnomalari va hook'lar tushib qoladi.",
      "qaror": "Ish papkalari `~/.local/share/loiha-dashboard/workspaces/<jobId>` (`WORKSPACES_DIR` bilan sozlanadi).",
      "oqibat": "Job fayllari loyiha papkasida ko'rinmaydi."
    },
    {
      "id": "Q-013",
      "sarlavha": "Jonli token oqimi (text_delta) DB'ga yozilmaydi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Har bir javob yuzlab delta qator yaratardi.",
      "qaror": "text_delta faqat jonli obunachilarga yuboriladi; to'liq assistant xabari, tool natijalari, init/result va status hodisalari saqlanadi. Q-011 ni aniqlashtiradi.",
      "oqibat": "Sahifa yangilanganda yarim chiqqan javob emas, faqat tugagan xabarlar qayta o'ynatiladi."
    },
    {
      "id": "Q-014",
      "sarlavha": "Server faqat 127.0.0.1 da tinglaydi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Autentifikatsiya yo'q, lokal ilova.",
      "qaror": "Hono server `127.0.0.1:4310` ga bog'lanadi.",
      "oqibat": "Tashqi tarmoqdan kirish yo'q; boshqa qurilmadan (masalan telefondan) ulanish uchun alohida qaror va autentifikatsiya kerak."
    },
    {
      "id": "Q-015",
      "sarlavha": "Claude job'lari ichki tool'larsiz, dontAsk rejimida",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Headless rejimda ruxsat so'rovi javobsiz qolib, job osilib qoladi.",
      "qaror": "Job'lar `--tools \"\"`, faqat profil MCP serverlari (`--strict-mcp-config`, `--allowedTools`) va `--permission-mode dontAsk` bilan ishlaydi; ruxsat ro'yxatida yo'q tool rad etiladi.",
      "oqibat": "Fayl bilan ishlovchi profillar (S5+) o'z ish papkasi bilan cheklangan tool'larni aniq ro'yxatda olishi kerak."
    },
    {
      "id": "Q-016",
      "sarlavha": "Prompt CLI'ga stdin orqali beriladi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Uzun promptlar va maxsus belgilarda argument chegaralari/escape muammolari bo'lmasligi kerak.",
      "qaror": "Prompt argument emas, stdin orqali uzatiladi.",
      "oqibat": "Runner promptni stdin ga yozib yopadi; promptni `ps` da ko'rib bo'lmaydi."
    },
    {
      "id": "Q-017",
      "sarlavha": "shadcn/ui komponentlari CLI'siz, qo'lda yozildi",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "shadcn CLI interaktiv va tarmoqdan shablon tortadi; S0 uchun 4 ta komponent (Button, Card, Textarea, Badge) yetarli.",
      "qaror": "Komponentlar shadcn uslubida qo'lda `apps/web/src/components/ui` ga yozildi.",
      "oqibat": "Keyingi komponentlar (Dialog, Dropdown va h.k.) kerak bo'lganda shadcn CLI ni ulash mumkin, tokenlar mos."
    },
    {
      "id": "Q-018",
      "sarlavha": "TanStack Router kod asosidagi routelar bilan",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Hozircha sahifalar kam, router-plugin kodgeneratsiyasi qo'shimcha murakkablik.",
      "qaror": "Code-based routelar, fayl asosidagi kodgeneratsiyasiz.",
      "oqibat": "Sahifalar ko'paysa (S1+) fayl asosidagi routingga o'tish qayta ko'rib chiqiladi."
    },
    {
      "id": "Q-019",
      "sarlavha": "Web va server faqat 127.0.0.1 da, Vite proksi orqali",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Lokal ilova, tashqi kirish kerak emas.",
      "qaror": "Web (5173) va server (4310) faqat 127.0.0.1 da; brauzer serverga Vite `/api` proksi orqali murojaat qiladi.",
      "oqibat": "CORS kerak emas. Q-014 ni to'ldiradi."
    },
    {
      "id": "Q-020",
      "sarlavha": "Boshlang'ich commit to'g'ridan-to'g'ri main ga",
      "sana": "2026-10-15",
      "sprint": "S0",
      "status": "qabul qilingan",
      "kontekst": "Repo bo'sh edi, branch ochish uchun asos yo'q edi.",
      "qaror": "Boshlang'ich commit (`aa65b29`) to'g'ridan-to'g'ri `main` ga qilindi.",
      "oqibat": "Keyingi ishlar (S1 dan boshlab) alohida branch'larda olib boriladi."
    },
    {
      "id": "Q-021",
      "sarlavha": "S1 rejadan 9 kun oldin boshlandi",
      "sana": "2026-10-17",
      "sprint": "S1",
      "status": "qabul qilingan",
      "kontekst": "S0 2026-10-17 da yakunlandi (rejadagi 2026-10-22 dan oldin). S1 rejada 2026-10-26 da boshlanishi kerak edi.",
      "qaror": "Foydalanuvchi darhol davom etishni tanladi: S1 2026-10-17 da boshlandi, tugash 2026-10-30 (2 hafta).",
      "oqibat": "S2…S9 sanalari hozircha o'zgartirilmaydi, S1 yakunida qayta ko'rib chiqiladi. Q-020 ga muvofiq S1 ishlari `sprint-01` branch'ida olib boriladi (`main` dan `2cd992e` commit'idan ochilgan)."
    },
    {
      "id": "Q-022",
      "sarlavha": "Maqsad darajalari va davr saqlash",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-01)",
      "status": "qabul qilingan",
      "kontekst": "Ierarxiyani minimal tutish kerak (S1 xavfi); turli darajalar bo'yicha kesishish so'rovlari oddiy bo'lishi kerak.",
      "qaror": "Maqsad darajalari faqat `year/quarter/month/week`; kunlik daraja — vazifalar (kunlik \"maqsad\" amalda vazifa). Davr `period_start`/`period_end` (YYYY-MM-DD matn, ikkalasi ham kiradi) sifatida saqlanadi, \"2026-W42\" kabi kalit emas. Sanalar vaqt zonasisiz lokal kalendar kuni.",
      "rad etilgan": "kunlik maqsad darajasi; davr kaliti (\"2026-W42\").",
      "oqibat": "Chegaralar S1-02 da hisoblanadi."
    },
    {
      "id": "Q-023",
      "sarlavha": "Vazifa rejasi plan_level + plan_start",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-01)",
      "status": "qabul qilingan",
      "kontekst": "Kun belgilanmagan \"shu hafta/oy\" vazifalari kerak.",
      "qaror": "`tasks` da `plan_level` (day/week/month) + `plan_start` juftligi. CHECK: ikkalasi birga null yoki birga to'ldirilgan.",
      "oqibat": "S1-10 drag-and-drop shunga tayanadi."
    },
    {
      "id": "Q-024",
      "sarlavha": "O'chirish siyosati",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-01)",
      "status": "qabul qilingan",
      "kontekst": "O'chirishda vazifalar yo'qolmasligi kerak.",
      "qaror": "goal → key_results CASCADE; goal/KR → tasks SET NULL; ota goal → bola goal SET NULL; task/tag → task_tags CASCADE.",
      "oqibat": "Maqsad o'chirilsa vazifalar \"bog'lanmagan\" bo'lib qoladi."
    },
    {
      "id": "Q-025",
      "sarlavha": "progress kesh ustun sifatida",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-01)",
      "status": "qabul qilingan",
      "kontekst": "Ierarxik progress har so'rovda hisoblanmasligi kerak.",
      "qaror": "`progress` (0…1) `goals` va `key_results` da kesh ustun; S1-03 yangilaydi. KR uchun: `target_value` bo'lsa raqamdan, bo'lmasa vazifalardan.",
      "oqibat": "Kesh eskirmasligi uchun S1-03 o'zgarishlarda qayta hisoblashi shart."
    },
    {
      "id": "Q-026",
      "sarlavha": "Teglar doirasi va keyinga qoldirilgan ustunlar",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-01)",
      "status": "qabul qilingan",
      "kontekst": "S1-01 doirasini toraytirish.",
      "qaror": "Teglar faqat vazifalar uchun (`task_tags`); nom `lower(name)` bo'yicha yagona. Takrorlanish (S1-04) va kalendar vaqt bloklari/eventId (S2) ustunlari ataylab qo'shilmadi — o'z vazifasida alohida migratsiya bilan.",
      "oqibat": "Maqsad teglari kerak bo'lsa keyin qo'shiladi."
    },
    {
      "id": "Q-027",
      "sarlavha": "Davr mantiqi @loiha/shared da, tashqi kutubxonasiz",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-02)",
      "status": "qabul qilingan",
      "kontekst": "Davr chegaralariga web (UI ko'rinishlari), server (API filtrlari) va dashboard-mcp muhtoj.",
      "qaror": "Mantiq `packages/shared/src/period.ts` da, `@loiha/shared` orqali eksport qilinadi — uchala iste'molchi bir xil chegaralardan foydalanadi. date-fns kabi kutubxona qo'shilmadi: kerakli mantiq kichik, Q-022 dagi vaqt zonasisiz YYYY-MM-DD uchun UTC arifmetikasi yetarli.",
      "rad etilgan": "date-fns va shunga o'xshash tashqi kutubxona; har ilovada alohida mantiq.",
      "oqibat": "S1-03, S1-06, S1-07…S1-09 va S1-12 shu moduldan foydalanadi."
    },
    {
      "id": "Q-028",
      "sarlavha": "periodKey faqat yordamchi, DB'da period_start/period_end",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-02)",
      "status": "qabul qilingan",
      "kontekst": "\"2026-W42\" kabi kalit ko'rsatish, URL va MCP uchun qulay.",
      "qaror": "`periodKey` / `parsePeriodKey` faqat ko'rsatish, URL va MCP uchun. DB'da Q-022 ga ko'ra hamon `period_start`/`period_end` saqlanadi.",
      "oqibat": "Q-022 o'zgarmaydi; kalit saqlash ustuni qo'shilmaydi."
    },
    {
      "id": "Q-029",
      "sarlavha": "Sinov vositasi — node:test + tsx",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-02)",
      "status": "qabul qilingan",
      "kontekst": "`packages/shared` da sinov vositasi yo'q edi.",
      "qaror": "`node:test` + `tsx` (`\"test\": \"tsx --test src/*.test.ts\"`); root'da `turbo run test`, `turbo.json` ga `test` vazifasi. Yangi bog'liqlik yo'q (tsx root'da bor).",
      "oqibat": "Sinovlar Node o'rnatilgandan keyin ishga tushirilishi kerak (hozircha ishga tushirilmagan)."
    },
    {
      "id": "Q-030",
      "sarlavha": "Maqsad progressi formulasi",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-03)",
      "status": "qabul qilingan",
      "kontekst": "Maqsad progressi KR, bola maqsad va vazifalardan yig'ilishi kerak (Q-025).",
      "qaror": "Qismlar: KR'lar, `dropped` bo'lmagan bola maqsadlar va to'g'ridan-to'g'ri (KR'siz) vazifalar ulushi — teng vaznli o'rtacha. To'g'ridan-to'g'ri vazifalar bitta qism hisoblanadi (aks holda ko'p mayda vazifa KR'larni \"bosib ketadi\"). `done` maqsad — 1; qism yo'q bo'lsa — 0. `cancelled` vazifalar hisobga olinmaydi. KR'ga bog'langan vazifa faqat KR orqali sanaladi (ikki marta emas). Raqamli KR kamayuvchi maqsadni ham qo'llaydi (masalan 80 → 70), natija 0…1 ga qisiladi; start = target bo'lsa current = target → 1.",
      "rad etilgan": "vazifalar soniga qarab vaznlash; KR'larga qo'lda vazn berish (kerak bo'lsa keyin alohida ustun bilan).",
      "oqibat": "Q-025 ni to'ldiradi."
    },
    {
      "id": "Q-031",
      "sarlavha": "Kesh ilova kodidagi recompute* bilan yangilanadi, trigger bilan emas",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-03)",
      "status": "qabul qilingan",
      "kontekst": "Q-025 keshni S1-03 yangilashini aytgan, usuli aniqlanmagan edi.",
      "qaror": "SQL trigger o'rniga aniq `recompute*` chaqiruvlari. Sabab: formula TypeScript'da bitta joyda (shared), sinash oson, UI ham shu formuladan foydalana oladi. `recomputeAllProgress` — tiklash/tekshiruv uchun.",
      "rad etilgan": "SQL trigger'lar.",
      "oqibat": "S1-05 (CRUD API) va S1-12 (MCP) har bir yozishdan keyin tegishli `recompute*` ni o'sha tranzaksiyada chaqirishi SHART. DoD dagi \"progress avtomatik yangilanadi\" mezoni S1-05 bilan to'liq yopiladi."
    },
    {
      "id": "Q-032",
      "sarlavha": "Formulalar @loiha/shared da, kesh yozish @loiha/db da (db → shared bog'liqlik)",
      "sana": "2026-10-17",
      "sprint": "S1 (S1-03)",
      "status": "qabul qilingan",
      "kontekst": "Formula DB'siz sinalishi va UI/serverda qayta ishlatilishi kerak (Q-027 bilan bir xil yondashuv).",
      "qaror": "taskCompletion, keyResultProgress, goalProgress, clamp01 — `@loiha/shared`; kesh yozish — `@loiha/db`. Shu sababli `@loiha/db` ga `@loiha/shared` workspace dependency qo'shildi, db paketiga `test` skripti qo'shildi.",
      "oqibat": "pnpm-lock.yaml yangilandi."
    },
    {
      "id": "Q-033",
      "sarlavha": "Takrorlanuvchi vazifalar alohida jadvalda, takrorlanishlar oldindan yaratiladi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-04)",
      "status": "qabul qilingan",
      "kontekst": "Takrorlanuvchi vazifalar kunlik/haftalik ko'rinish, drag-and-drop, progress va MCP bilan maxsus holatsiz ishlashi kerak.",
      "qaror": "Seriya alohida `task_recurrences` jadvalida; har takrorlanish `tasks` da oddiy kunlik vazifa (materializatsiya), `tasks.recurrence_id` (FK SET NULL) + `occurrence_date`, yagona indeks (recurrence_id, occurrence_date). Seriyaning o'zi progressga kirmaydi (S1-03 buzilmaydi).",
      "rad etilgan": "tasks jadvalida shablon-vazifa (progressni buzardi); virtual (so'rovda hisoblanadigan) takrorlanishlar (status va ko'chirishni saqlab bo'lmaydi).",
      "oqibat": "Migratsiya `0002_s1_task_recurrences.sql`: drizzle-kit ALTER TABLE'da `ON DELETE set null` ni tushirib qoldirgani uchun qo'lda qo'shildi."
    },
    {
      "id": "Q-034",
      "sarlavha": "Takrorlanish qoidasi — o'zimizning JSON, RRULE emas",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-04)",
      "status": "qabul qilingan",
      "kontekst": "Qoida formatini tanlash kerak edi.",
      "qaror": "JSON: daily/weekly/monthly + interval, weekdays 1…7, monthDays 1…31 va -1 (oxirgi kun), zod bilan tekshiriladi. Oyda bo'lmagan kun (31) o'tkazib yuboriladi (RFC 5545 xatti-harakati). Haftalik interval `start` haftasining dushanbasidan sanaladi. Sabab: kichik, UI'da qurish oson. Kutubxonasiz (Q-027 yondashuvi).",
      "rad etilgan": "rrule kutubxonasi / RFC 5545 RRULE.",
      "oqibat": "Kerak bo'lsa S2 da Google Calendar uchun RRULE'ga o'giriladi."
    },
    {
      "id": "Q-035",
      "sarlavha": "Generatsiya gorizonti 14 kun, generated_until bilan",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-04)",
      "status": "qabul qilingan",
      "kontekst": "Qancha oldinga yaratish va o'zgarish/o'chirishda nima bo'lishi aniqlanishi kerak edi.",
      "qaror": "Standart gorizont — bugundan 14 kun (`RECURRENCE_HORIZON_DAYS`), `generated_until` bilan idempotent. O'chirilgan takrorlanish qayta yaratilmaydi; seriya o'chirilsa vazifalar oddiy vazifa bo'lib qoladi (SET NULL). Qoida o'zgarganda `resetFutureOccurrences` faqat kelajakdagi `todo` larni o'chirib, generated_until ni orqaga suradi; bajarilgan/boshlanganlari tarix sifatida qoladi. Yaratgandan keyin `recomputeForTask` chaqiriladi (Q-031).",
      "oqibat": "S1-05 (CRUD) seriyani yaratish/o'zgartirishda `resetFutureOccurrences` + `materializeRecurrences` ni chaqirishi SHART."
    },
    {
      "id": "Q-036",
      "sarlavha": "Generatsiya server jarayonida, alohida cron/job emas",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-04)",
      "status": "qabul qilingan",
      "kontekst": "Materializatsiya qachon ishlashi kerak.",
      "qaror": "`apps/server/src/index.ts` da ishga tushganda va har soatda `materializeRecurrences` chaqiriladi. Lokal bitta foydalanuvchi uchun yetarli.",
      "rad etilgan": "alohida cron / job navbati.",
      "oqibat": "Server real ishga tushirib sinalmagan (faqat sinovlar va typecheck)."
    },
    {
      "id": "Q-037",
      "sarlavha": "Biznes mantiq @loiha/db servis qatlamida, server faqat HTTP",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-05)",
      "status": "qabul qilingan",
      "kontekst": "CRUD tekshiruvlari va progress yangilash S1-12 dagi dashboard-mcp da ham kerak.",
      "qaror": "list/get/create/update/delete (goals, KR, tasks, recurrences, tags) `packages/db/src/planning.ts` da; xatolar `PlanningError` (not_found/invalid/conflict), server ularni 404/400/409 ga o'giradi. Har yozish o'z tranzaksiyasida `recompute*` bilan (Q-031 bajarildi).",
      "rad etilgan": "mantiqni Hono route'larida yozish (MCP bilan takrorlanardi).",
      "oqibat": "S1-12 MCP tool'lari planning.ts servislarini chaqirishi kerak."
    },
    {
      "id": "Q-038",
      "sarlavha": "Enum va API sxemalari @loiha/shared da",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-05)",
      "status": "qabul qilingan",
      "kontekst": "Web formalari ham bir xil qiymat va tekshiruvlarni ishlatadi.",
      "qaror": "GOAL_LEVELS/PLAN_LEVELS/GOAL_STATUSES/TASK_STATUSES, zod sxemalari va DTO'lar `packages/shared/src/planning.ts` da; db schema enum'larni re-export qiladi (bitta manba)."
    },
    {
      "id": "Q-039",
      "sarlavha": "Maqsad ierarxiyasi qat'iy tekshiriladi, davr `date` bilan beriladi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-05)",
      "status": "qabul qilingan",
      "kontekst": "Noto'g'ri ota-bola bog'lanishi va sikllarni oldini olish kerak.",
      "qaror": "Ota darajasi bola darajasidan yuqori (sikl shu bilan istisno), bola davri ota davri ichida; davr o'zgarib bolalar tashqarida qolsa — 409. Darajani PATCH bilan o'zgartirib bo'lmaydi. API'da davr `date` (davr ichidagi istalgan sana) bilan beriladi, server `periodOf` bilan chegaraga keltiradi; vazifa rejasi `plan: {level, date}` → davr boshi."
    },
    {
      "id": "Q-040",
      "sarlavha": "Vazifada KR berilsa goal_id KR maqsadidan olinadi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-05)",
      "status": "qabul qilingan",
      "kontekst": "Vazifaning maqsadi va KR maqsadi mos bo'lishi kerak.",
      "qaror": "Vazifa/seriyada KR berilsa goal_id KR maqsadidan olinadi (mos kelmasa 400). KR o'chirilsa vazifalar maqsadning to'g'ridan-to'g'ri vazifalariga aylanadi. PATCH'da faqat maqsad o'zgarsa, boshqa maqsadga tegishli KR olib tashlanadi."
    },
    {
      "id": "Q-041",
      "sarlavha": "PATCH semantikasi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-05)",
      "status": "qabul qilingan",
      "kontekst": "Qisman yangilash qoidalarini belgilash kerak edi.",
      "qaror": "Maydon yo'q — o'zgarmaydi; null — tozalanadi. completed_at status done bo'lganda qo'yiladi, qayta ochilganda tozalanadi. tagIds — to'liq to'plam (almashtiriladi)."
    },
    {
      "id": "Q-042",
      "sarlavha": "Seriya o'zgarganda kelajakdagi todo takrorlanishlar qayta yaratiladi; o'tmish yaratilmaydi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-05)",
      "status": "qabul qilingan",
      "kontekst": "Q-035 seriya o'zgarganda qayta yaratishni talab qildi; o'tmishdagi start_date \"qarz\" vazifalar to'plashi mumkin edi.",
      "qaror": "Seriya o'zgarganda/to'xtatilganda bugundan boshlab boshlanmagan (todo) takrorlanishlar qayta yaratiladi; o'chirilganda o'tganlari oddiy vazifa bo'lib qoladi. `materializeRecurrences(db, { from, until })` endi `from` (standart bugun) dan oldin vazifa yaratmaydi. Q-035 ni aniqlashtiradi.",
      "oqibat": "Ma'lum cheklov — qayta yaratilgan todo vazifalardagi qo'lda o'zgarishlar yo'qoladi. S1-06 list endpoint'larga davr filtri va daraxt so'rovlarini qo'shadi."
    },
    {
      "id": "Q-043",
      "sarlavha": "Davr filtri kesishuv (overlap) semantikasi bilan ishlaydi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-06)",
      "status": "qabul qilingan",
      "kontekst": "Maqsad va vazifalar turli davrlarda (yil/kvartal/oy/hafta/kun); \"shu haftaning ro'yxati\" uchun bitta qoida kerak edi.",
      "qaror": "Maqsad: `period_start <= end AND period_end >= start`. Vazifa rejasi davri so'ralgan oraliq bilan kesishsa kiradi (hafta ko'rinishida shu oyning oylik vazifalari ham chiqadi, oy ko'rinishida oy chegarasidan o'tgan hafta ham). Toraytirish uchun `planLevel`. SQL'da indeksga mos oddiy shartlar (haftalik: plan_start >= start-6, oylik: plan_start >= oy boshi).",
      "rad etilgan": "faqat davr ichida to'liq joylashganlar — oylik vazifalar hafta ko'rinishida yo'qolardi.",
      "oqibat": "S1-07…S1-09 UI va S1-12 MCP shu qoidadan foydalanadi."
    },
    {
      "id": "Q-044",
      "sarlavha": "Filtr kirishi — `period` kaliti yoki `from`/`to`",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-06)",
      "status": "qabul qilingan",
      "kontekst": "Filtrni bir ma'noli berish kerak.",
      "qaror": "`period` (Q-028 dagi periodKey formati) yoki `from`/`to` — ikkalasi birga berilsa 400. `status`, `level`, `planLevel` vergul bilan bir nechta qiymat qabul qiladi. Vazifalarda `unplanned=true` (inbox)."
    },
    {
      "id": "Q-045",
      "sarlavha": "Maqsad daraxti xotirada quriladi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-06)",
      "status": "qabul qilingan",
      "kontekst": "`getGoalTree` ierarxiyani qaytarishi kerak.",
      "qaror": "Barcha maqsadlar bitta so'rov bilan olinib xotirada quriladi (bitta foydalanuvchi hajmi); filtr barcha tugunlarga qo'llanadi; otasi filtrdan o'tmagan maqsad ildiz bo'lib chiqadi; `rootId` berilsa ildiz doim kiradi; `seen` bilan sikldan himoya. `taskCounts` — maqsadga bog'langan (Q-040 bo'yicha KR orqali ham) bekor qilinmagan vazifalar {total, done}.",
      "rad etilgan": "rekursiv SQL CTE — murakkabroq, foyda yo'q."
    },
    {
      "id": "Q-046",
      "sarlavha": "Ro'yxat filtrlari `@loiha/shared` zod sxemalari bilan",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-06)",
      "status": "qabul qilingan",
      "kontekst": "Server va MCP bir xil tekshiruvdan o'tishi kerak.",
      "qaror": "`listGoalsQuerySchema`, `listTasksQuerySchema`, `goalTreeQuerySchema` shared'da; servis funksiyalari parse qilingan qiymatni qabul qiladi (S1-12 MCP ham shu sxemalardan o'tkazadi).",
      "oqibat": "Teg va matn bo'yicha qidiruv — S1-11."
    },
    {
      "id": "Q-047",
      "sarlavha": "Maqsadlar xaritasi bitta daraxt so'rovidan quriladi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-07)",
      "status": "qabul qilingan",
      "kontekst": "Yil/kvartal xaritasi joriy davr maqsadlarini va kichik davrlar ustunlarini ko'rsatadi.",
      "qaror": "`GET /api/goals/tree?period=…` dan bitta so'rov, UI'da tekislanadi: tepada joriy davr maqsadlari, pastda kichik davrlar ustunlari (yil → 4 kvartal, kvartal → 3 oy). Ota maqsad tanlovi uchun yuqori darajali maqsadlar ham shu javobda bor.",
      "oqibat": "S1-08 shu sahifaga Oy/Hafta tablarini qo'shadi va GoalSheet/GoalCard'ni qayta ishlatadi."
    },
    {
      "id": "Q-048",
      "sarlavha": "Ko'rinish holati URL search parametrlarida",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-07)",
      "status": "qabul qilingan",
      "kontekst": "Havola va orqaga tugmasi ishlashi kerak.",
      "qaror": "`view` (yil|kvartal) va `period` (Q-028 periodKey) URL'da. Darajasi mos kelmagan kalit ko'rinish darajasiga keltiriladi (kvartal + 2026 → joriy yoki 1-kvartal)."
    },
    {
      "id": "Q-049",
      "sarlavha": "Tahrirlash o'ng panelda (Sheet), Radix Dialog qo'shilmadi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-07)",
      "status": "qabul qilingan",
      "kontekst": "Tahrirlashda xarita konteksti yo'qolmasligi kerak.",
      "qaror": "Alohida sahifa o'rniga o'ng panel; oddiy o'z komponentimiz (Esc/fon bosilsa yopiladi).",
      "rad etilgan": "Radix Dialog — yangi bog'liqlik kerak emas."
    },
    {
      "id": "Q-050",
      "sarlavha": "Ota maqsad tanlovi server qoidasini UI'da takrorlaydi",
      "sana": "2026-10-19",
      "sprint": "S1 (S1-07)",
      "status": "qabul qilingan",
      "kontekst": "Server Q-039 qoidasini tekshiradi; foydalanuvchi noto'g'ri tanlov qilmasligi kerak.",
      "qaror": "Faqat darajasi yuqori va davri qamragan maqsadlar ko'rsatiladi; davr o'zgarsa mos kelmagan ota tozalanadi."
    }
  ],
  "hisobotlar": [
    {
      "sprint": "S0",
      "sana": "2026-10-17",
      "status": "yakunlangan",
      "fayl": "sprints/hisobotlar/sprint-00-hisobot.md",
      "xulosa": "Maqsadga erishildi: monorepo, SQLite/Drizzle, Hono server, job navbati, Claude CLI runner (stream-json + SSE), dashboard-mcp skeleti va web UI (AI konsol) tayyor. Barcha 15 vazifa va 4/4 qabul mezoni bajarildi. Sprint rejadagi 2026-10-22 o'rniga 2026-10-17 da yakunlandi (5 kun oldin). Bitta bloker (Claude CLI 401 login) bo'ldi va yechildi."
    }
  ]
};

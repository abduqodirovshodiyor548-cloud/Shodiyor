// Avtomatik yaratilgan: node scripts/jarayon-sync.mjs. Qo'lda tahrirlamang.
window.JARAYON = {
  "yangilangan": "2026-10-17T11:05:22.172Z",
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
      "status": "rejalashtirilgan",
      "boshlanish": "2026-10-26",
      "tugash": "2026-11-06",
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
          "title": "Jadvallar: `goals` (daraja, ota maqsad, davr), `key_results`, `tasks`, `tags`",
          "group": "Ma'lumot modeli",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-02",
          "title": "Davr mantiqi: yil/kvartal/oy/hafta/kun chegaralari (ISO hafta)",
          "group": "Ma'lumot modeli",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-03",
          "title": "Progress hisoblash: vazifalardan key result'ga, undan maqsadlarga yuqoriga yig'ilish",
          "group": "Ma'lumot modeli",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-04",
          "title": "Takrorlanuvchi vazifalar (kunlik, haftalik, maxsus qoida)",
          "group": "Ma'lumot modeli",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-05",
          "title": "Maqsad, key result va vazifalar uchun CRUD endpoint'lar",
          "group": "API",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-06",
          "title": "Davr bo'yicha filtr va daraxt ko'rinishidagi so'rovlar",
          "group": "API",
          "status": "rejalashtirilgan"
        },
        {
          "id": "S1-07",
          "title": "Yillik va kvartal ko'rinishi (maqsadlar xaritasi)",
          "group": "UI",
          "status": "rejalashtirilgan"
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

# Qarorlar jurnali

Loyiha davomida qabul qilingan texnik va mahsulot qarorlari. Yangi qaror pastga qo'shiladi, eskisi o'chirilmaydi. Qaror o'zgarsa, eskisining statusi `almashtirilgan` qilinadi va yangisi unga havola beradi.

Format (hisobotchi agent va sinxron skript shunga tayanadi):

```
## Q-NNN: Qisqa sarlavha
- **Sana:** YYYY-MM-DD
- **Sprint:** S0
- **Status:** qabul qilingan   (taklif | qabul qilingan | almashtirilgan | bekor qilingan)
- **Kontekst:** Nega bu savol paydo bo'ldi
- **Qaror:** Nima tanlandi
- **Oqibat:** Bu nimaga ta'sir qiladi, qanday cheklov qo'yadi
```

---

## Q-001: Frontend va backend alohida, TypeScript monorepo
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Ilova lokalda ishlaydi va doimiy fon jarayonlari bor (Telegram bot, kalendar sinxronizatsiyasi, Claude CLI jarayonlari).
- **Qaror:** pnpm workspaces + Turborepo. Frontend: Vite + React 19 + TanStack Router/Query + Tailwind + shadcn/ui. Backend: Hono (Node). Next.js tanlanmadi.
- **Oqibat:** Web, server va bot alohida ilovalar bo'ladi, umumiy kod `packages/*` ichida turadi.

## Q-002: Ma'lumotlar bazasi — SQLite + Drizzle
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Bir foydalanuvchili lokal ilova, server o'rnatish va boshqarish ortiqcha.
- **Qaror:** SQLite + Drizzle ORM. Qidiruv uchun FTS5, keyinroq sqlite-vec. Job navbati ham SQLite jadvalida (Redis yo'q).
- **Oqibat:** Backup bitta faylni nusxalash bilan bajariladi. Yuqori darajadagi parallel yozish kerak emas.

## Q-003: AI funksiyalar Claude CLI orqali, integratsiyalar MCP orqali
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Barcha AI ishlarini to'g'ridan-to'g'ri API emas, lokal Claude CLI bajarishi talab qilingan.
- **Qaror:** Server har bir AI vazifani `claude -p --output-format stream-json` jarayoni sifatida ishga tushiradi. Vazifa turiga qarab `--mcp-config` va `--allowedTools` profili beriladi. Dashboard ma'lumotlari Claude'ga o'zimizning `dashboard-mcp` serveri orqali ochiladi.
- **Oqibat:** Claude CLI o'rnatilgan va login qilingan bo'lishi shart. Parallel AI vazifalar soni cheklanadi.

## Q-004: Telegram bot long polling bilan
- **Sana:** 2026-10-15
- **Sprint:** S4
- **Status:** qabul qilingan
- **Kontekst:** Lokal ilovada public URL yo'q, webhook ishlatib bo'lmaydi.
- **Qaror:** grammY kutubxonasi, long polling, chat ID bo'yicha whitelist.
- **Oqibat:** Bot faqat kompyuter yoqiq bo'lganda ishlaydi.

## Q-005: Kalendar sinxronizatsiyasi polling bilan
- **Sana:** 2026-10-15
- **Sprint:** S2
- **Status:** qabul qilingan
- **Kontekst:** Google Calendar push-bildirishnomalari public HTTPS endpoint talab qiladi.
- **Qaror:** Har 5 daqiqada syncToken bilan inkremental polling.
- **Oqibat:** Kalendardagi o'zgarish dashboard'ga 5 daqiqagacha kechikib keladi.

## Q-006: pnpm 12.11.2 corepack orqali, native build'lar `allowBuilds` bilan
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Global `/usr/local/bin` ga yozish ruxsati yo'q edi.
- **Qaror:** pnpm 12.11.2 corepack orqali `~/.local/bin` ga o'rnatildi; `package.json` da `packageManager: pnpm@12.11.2`. Native build'lar `pnpm-workspace.yaml` dagi `allowBuilds` bilan ruxsat etiladi (esbuild, better-sqlite3).
- **Oqibat:** pnpm 12 da `onlyBuiltDependencies` ishlamaydi, yangi native paket qo'shilganda `allowBuilds` ga qo'shish kerak. `~/.local/bin` PATH da bo'lishi shart.

## Q-007: TypeScript 6.0 ga mahkamlandi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** TypeScript 7.0.2 latest, lekin typescript-eslint 8.71 faqat `<6.1.0` ni qo'llab-quvvatlaydi.
- **Qaror:** TypeScript 6.0 ishlatiladi.
- **Oqibat:** TS 7 ga o'tish typescript-eslint yangilanishini kutadi.

## Q-008: Ichki paketlar build qilinmaydi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** `@loiha/*` paketlari faqat monorepo ichida ishlatiladi.
- **Qaror:** `exports` to'g'ridan-to'g'ri `src/index.ts` ga qaraydi; server tsx bilan, web Vite bilan ishlatadi.
- **Oqibat:** Alohida build bosqichi yo'q, faqat typecheck.

## Q-009: Standart portlar va DB fayli
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Lokal ishlab chiqish uchun aniq standartlar kerak.
- **Qaror:** Server porti 4310, web 5173; DB fayli `data/dashboard.db` (gitignore qilingan).
- **Oqibat:** Port o'zgarsa `.env` orqali sozlanadi; DB fayli repoga tushmaydi, backup alohida.

## Q-010: Migratsiyalar server ishga tushganda avtomatik qo'llanadi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Bir foydalanuvchili lokal ilova, alohida migratsiya bosqichi ortiqcha.
- **Qaror:** `getDb()` birinchi chaqiruvda migratsiyalarni avtomatik qo'llaydi.
- **Oqibat:** Sxema o'zgarsa `pnpm db:generate` bilan migratsiya fayli yaratilib, commit qilinadi.

## Q-011: Job hodisalari job_events jadvalida saqlanadi, SSE shundan qayta o'ynatiladi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Brauzer qayta ulanganda yoki sahifa yangilanganda job chiqishi yo'qolmasligi kerak.
- **Qaror:** Claude stream-json xabarlari `job_events` ga yoziladi; SSE shu jadvaldan `seq` bo'yicha qayta o'ynatadi.
- **Oqibat:** Uzun job'lar ko'p qator yozadi — S9 da tozalash siyosati kerak bo'ladi.

## Q-012: Claude job ish papkalari loyihadan tashqarida
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Claude CLI cwd va uning ota papkalaridagi CLAUDE.md va .claude sozlamalarini yuklaydi; loyiha ichida bo'lsa job'larga dasturlash yo'riqnomalari va hook'lar tushib qoladi.
- **Qaror:** Ish papkalari `~/.local/share/loiha-dashboard/workspaces/<jobId>` (`WORKSPACES_DIR` bilan sozlanadi).
- **Oqibat:** Job fayllari loyiha papkasida ko'rinmaydi.

## Q-013: Jonli token oqimi (text_delta) DB'ga yozilmaydi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Har bir javob yuzlab delta qator yaratardi.
- **Qaror:** text_delta faqat jonli obunachilarga yuboriladi; to'liq assistant xabari, tool natijalari, init/result va status hodisalari saqlanadi. Q-011 ni aniqlashtiradi.
- **Oqibat:** Sahifa yangilanganda yarim chiqqan javob emas, faqat tugagan xabarlar qayta o'ynatiladi.

## Q-014: Server faqat 127.0.0.1 da tinglaydi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Autentifikatsiya yo'q, lokal ilova.
- **Qaror:** Hono server `127.0.0.1:4310` ga bog'lanadi.
- **Oqibat:** Tashqi tarmoqdan kirish yo'q; boshqa qurilmadan (masalan telefondan) ulanish uchun alohida qaror va autentifikatsiya kerak.

## Q-015: Claude job'lari ichki tool'larsiz, dontAsk rejimida
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Headless rejimda ruxsat so'rovi javobsiz qolib, job osilib qoladi.
- **Qaror:** Job'lar `--tools ""`, faqat profil MCP serverlari (`--strict-mcp-config`, `--allowedTools`) va `--permission-mode dontAsk` bilan ishlaydi; ruxsat ro'yxatida yo'q tool rad etiladi.
- **Oqibat:** Fayl bilan ishlovchi profillar (S5+) o'z ish papkasi bilan cheklangan tool'larni aniq ro'yxatda olishi kerak.

## Q-016: Prompt CLI'ga stdin orqali beriladi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Uzun promptlar va maxsus belgilarda argument chegaralari/escape muammolari bo'lmasligi kerak.
- **Qaror:** Prompt argument emas, stdin orqali uzatiladi.
- **Oqibat:** Runner promptni stdin ga yozib yopadi; promptni `ps` da ko'rib bo'lmaydi.

## Q-017: shadcn/ui komponentlari CLI'siz, qo'lda yozildi
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** shadcn CLI interaktiv va tarmoqdan shablon tortadi; S0 uchun 4 ta komponent (Button, Card, Textarea, Badge) yetarli.
- **Qaror:** Komponentlar shadcn uslubida qo'lda `apps/web/src/components/ui` ga yozildi.
- **Oqibat:** Keyingi komponentlar (Dialog, Dropdown va h.k.) kerak bo'lganda shadcn CLI ni ulash mumkin, tokenlar mos.

## Q-018: TanStack Router kod asosidagi routelar bilan
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Hozircha sahifalar kam, router-plugin kodgeneratsiyasi qo'shimcha murakkablik.
- **Qaror:** Code-based routelar, fayl asosidagi kodgeneratsiyasiz.
- **Oqibat:** Sahifalar ko'paysa (S1+) fayl asosidagi routingga o'tish qayta ko'rib chiqiladi.

## Q-019: Web va server faqat 127.0.0.1 da, Vite proksi orqali
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Lokal ilova, tashqi kirish kerak emas.
- **Qaror:** Web (5173) va server (4310) faqat 127.0.0.1 da; brauzer serverga Vite `/api` proksi orqali murojaat qiladi.
- **Oqibat:** CORS kerak emas. Q-014 ni to'ldiradi.

## Q-020: Boshlang'ich commit to'g'ridan-to'g'ri main ga
- **Sana:** 2026-10-15
- **Sprint:** S0
- **Status:** qabul qilingan
- **Kontekst:** Repo bo'sh edi, branch ochish uchun asos yo'q edi.
- **Qaror:** Boshlang'ich commit (`aa65b29`) to'g'ridan-to'g'ri `main` ga qilindi.
- **Oqibat:** Keyingi ishlar (S1 dan boshlab) alohida branch'larda olib boriladi.

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

## Q-021: S1 rejadan 9 kun oldin boshlandi
- **Sana:** 2026-10-17
- **Sprint:** S1
- **Status:** qabul qilingan
- **Kontekst:** S0 2026-10-17 da yakunlandi (rejadagi 2026-10-22 dan oldin). S1 rejada 2026-10-26 da boshlanishi kerak edi.
- **Qaror:** Foydalanuvchi darhol davom etishni tanladi: S1 2026-10-17 da boshlandi, tugash 2026-10-30 (2 hafta).
- **Oqibat:** S2…S9 sanalari hozircha o'zgartirilmaydi, S1 yakunida qayta ko'rib chiqiladi. Q-020 ga muvofiq S1 ishlari `sprint-01` branch'ida olib boriladi (`main` dan `2cd992e` commit'idan ochilgan).

## Q-022: Maqsad darajalari va davr saqlash
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-01)
- **Status:** qabul qilingan
- **Kontekst:** Ierarxiyani minimal tutish kerak (S1 xavfi); turli darajalar bo'yicha kesishish so'rovlari oddiy bo'lishi kerak.
- **Qaror:** Maqsad darajalari faqat `year/quarter/month/week`; kunlik daraja — vazifalar (kunlik "maqsad" amalda vazifa). Davr `period_start`/`period_end` (YYYY-MM-DD matn, ikkalasi ham kiradi) sifatida saqlanadi, "2026-W42" kabi kalit emas. Sanalar vaqt zonasisiz lokal kalendar kuni.
- **Rad etilgan:** kunlik maqsad darajasi; davr kaliti ("2026-W42").
- **Oqibat:** Chegaralar S1-02 da hisoblanadi.

## Q-023: Vazifa rejasi plan_level + plan_start
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-01)
- **Status:** qabul qilingan
- **Kontekst:** Kun belgilanmagan "shu hafta/oy" vazifalari kerak.
- **Qaror:** `tasks` da `plan_level` (day/week/month) + `plan_start` juftligi. CHECK: ikkalasi birga null yoki birga to'ldirilgan.
- **Oqibat:** S1-10 drag-and-drop shunga tayanadi.

## Q-024: O'chirish siyosati
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-01)
- **Status:** qabul qilingan
- **Kontekst:** O'chirishda vazifalar yo'qolmasligi kerak.
- **Qaror:** goal → key_results CASCADE; goal/KR → tasks SET NULL; ota goal → bola goal SET NULL; task/tag → task_tags CASCADE.
- **Oqibat:** Maqsad o'chirilsa vazifalar "bog'lanmagan" bo'lib qoladi.

## Q-025: progress kesh ustun sifatida
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-01)
- **Status:** qabul qilingan
- **Kontekst:** Ierarxik progress har so'rovda hisoblanmasligi kerak.
- **Qaror:** `progress` (0…1) `goals` va `key_results` da kesh ustun; S1-03 yangilaydi. KR uchun: `target_value` bo'lsa raqamdan, bo'lmasa vazifalardan.
- **Oqibat:** Kesh eskirmasligi uchun S1-03 o'zgarishlarda qayta hisoblashi shart.

## Q-026: Teglar doirasi va keyinga qoldirilgan ustunlar
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-01)
- **Status:** qabul qilingan
- **Kontekst:** S1-01 doirasini toraytirish.
- **Qaror:** Teglar faqat vazifalar uchun (`task_tags`); nom `lower(name)` bo'yicha yagona. Takrorlanish (S1-04) va kalendar vaqt bloklari/eventId (S2) ustunlari ataylab qo'shilmadi — o'z vazifasida alohida migratsiya bilan.
- **Oqibat:** Maqsad teglari kerak bo'lsa keyin qo'shiladi.

## Q-027: Davr mantiqi @loiha/shared da, tashqi kutubxonasiz
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-02)
- **Status:** qabul qilingan
- **Kontekst:** Davr chegaralariga web (UI ko'rinishlari), server (API filtrlari) va dashboard-mcp muhtoj.
- **Qaror:** Mantiq `packages/shared/src/period.ts` da, `@loiha/shared` orqali eksport qilinadi — uchala iste'molchi bir xil chegaralardan foydalanadi. date-fns kabi kutubxona qo'shilmadi: kerakli mantiq kichik, Q-022 dagi vaqt zonasisiz YYYY-MM-DD uchun UTC arifmetikasi yetarli.
- **Rad etilgan:** date-fns va shunga o'xshash tashqi kutubxona; har ilovada alohida mantiq.
- **Oqibat:** S1-03, S1-06, S1-07…S1-09 va S1-12 shu moduldan foydalanadi.

## Q-028: periodKey faqat yordamchi, DB'da period_start/period_end
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-02)
- **Status:** qabul qilingan
- **Kontekst:** "2026-W42" kabi kalit ko'rsatish, URL va MCP uchun qulay.
- **Qaror:** `periodKey` / `parsePeriodKey` faqat ko'rsatish, URL va MCP uchun. DB'da Q-022 ga ko'ra hamon `period_start`/`period_end` saqlanadi.
- **Oqibat:** Q-022 o'zgarmaydi; kalit saqlash ustuni qo'shilmaydi.

## Q-029: Sinov vositasi — node:test + tsx
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-02)
- **Status:** qabul qilingan
- **Kontekst:** `packages/shared` da sinov vositasi yo'q edi.
- **Qaror:** `node:test` + `tsx` (`"test": "tsx --test src/*.test.ts"`); root'da `turbo run test`, `turbo.json` ga `test` vazifasi. Yangi bog'liqlik yo'q (tsx root'da bor).
- **Oqibat:** Sinovlar Node o'rnatilgandan keyin ishga tushirilishi kerak (hozircha ishga tushirilmagan).

## Q-030: Maqsad progressi formulasi
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-03)
- **Status:** qabul qilingan
- **Kontekst:** Maqsad progressi KR, bola maqsad va vazifalardan yig'ilishi kerak (Q-025).
- **Qaror:** Qismlar: KR'lar, `dropped` bo'lmagan bola maqsadlar va to'g'ridan-to'g'ri (KR'siz) vazifalar ulushi — teng vaznli o'rtacha. To'g'ridan-to'g'ri vazifalar bitta qism hisoblanadi (aks holda ko'p mayda vazifa KR'larni "bosib ketadi"). `done` maqsad — 1; qism yo'q bo'lsa — 0. `cancelled` vazifalar hisobga olinmaydi. KR'ga bog'langan vazifa faqat KR orqali sanaladi (ikki marta emas). Raqamli KR kamayuvchi maqsadni ham qo'llaydi (masalan 80 → 70), natija 0…1 ga qisiladi; start = target bo'lsa current = target → 1.
- **Rad etilgan:** vazifalar soniga qarab vaznlash; KR'larga qo'lda vazn berish (kerak bo'lsa keyin alohida ustun bilan).
- **Oqibat:** Q-025 ni to'ldiradi.

## Q-031: Kesh ilova kodidagi recompute* bilan yangilanadi, trigger bilan emas
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-03)
- **Status:** qabul qilingan
- **Kontekst:** Q-025 keshni S1-03 yangilashini aytgan, usuli aniqlanmagan edi.
- **Qaror:** SQL trigger o'rniga aniq `recompute*` chaqiruvlari. Sabab: formula TypeScript'da bitta joyda (shared), sinash oson, UI ham shu formuladan foydalana oladi. `recomputeAllProgress` — tiklash/tekshiruv uchun.
- **Rad etilgan:** SQL trigger'lar.
- **Oqibat:** S1-05 (CRUD API) va S1-12 (MCP) har bir yozishdan keyin tegishli `recompute*` ni o'sha tranzaksiyada chaqirishi SHART. DoD dagi "progress avtomatik yangilanadi" mezoni S1-05 bilan to'liq yopiladi.

## Q-032: Formulalar @loiha/shared da, kesh yozish @loiha/db da (db → shared bog'liqlik)
- **Sana:** 2026-10-17
- **Sprint:** S1 (S1-03)
- **Status:** qabul qilingan
- **Kontekst:** Formula DB'siz sinalishi va UI/serverda qayta ishlatilishi kerak (Q-027 bilan bir xil yondashuv).
- **Qaror:** taskCompletion, keyResultProgress, goalProgress, clamp01 — `@loiha/shared`; kesh yozish — `@loiha/db`. Shu sababli `@loiha/db` ga `@loiha/shared` workspace dependency qo'shildi, db paketiga `test` skripti qo'shildi.
- **Oqibat:** pnpm-lock.yaml yangilandi.

## Q-033: Takrorlanuvchi vazifalar alohida jadvalda, takrorlanishlar oldindan yaratiladi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-04)
- **Status:** qabul qilingan
- **Kontekst:** Takrorlanuvchi vazifalar kunlik/haftalik ko'rinish, drag-and-drop, progress va MCP bilan maxsus holatsiz ishlashi kerak.
- **Qaror:** Seriya alohida `task_recurrences` jadvalida; har takrorlanish `tasks` da oddiy kunlik vazifa (materializatsiya), `tasks.recurrence_id` (FK SET NULL) + `occurrence_date`, yagona indeks (recurrence_id, occurrence_date). Seriyaning o'zi progressga kirmaydi (S1-03 buzilmaydi).
- **Rad etilgan:** tasks jadvalida shablon-vazifa (progressni buzardi); virtual (so'rovda hisoblanadigan) takrorlanishlar (status va ko'chirishni saqlab bo'lmaydi).
- **Oqibat:** Migratsiya `0002_s1_task_recurrences.sql`: drizzle-kit ALTER TABLE'da `ON DELETE set null` ni tushirib qoldirgani uchun qo'lda qo'shildi.

## Q-034: Takrorlanish qoidasi — o'zimizning JSON, RRULE emas
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-04)
- **Status:** qabul qilingan
- **Kontekst:** Qoida formatini tanlash kerak edi.
- **Qaror:** JSON: daily/weekly/monthly + interval, weekdays 1…7, monthDays 1…31 va -1 (oxirgi kun), zod bilan tekshiriladi. Oyda bo'lmagan kun (31) o'tkazib yuboriladi (RFC 5545 xatti-harakati). Haftalik interval `start` haftasining dushanbasidan sanaladi. Sabab: kichik, UI'da qurish oson. Kutubxonasiz (Q-027 yondashuvi).
- **Rad etilgan:** rrule kutubxonasi / RFC 5545 RRULE.
- **Oqibat:** Kerak bo'lsa S2 da Google Calendar uchun RRULE'ga o'giriladi.

## Q-035: Generatsiya gorizonti 14 kun, generated_until bilan
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-04)
- **Status:** qabul qilingan
- **Kontekst:** Qancha oldinga yaratish va o'zgarish/o'chirishda nima bo'lishi aniqlanishi kerak edi.
- **Qaror:** Standart gorizont — bugundan 14 kun (`RECURRENCE_HORIZON_DAYS`), `generated_until` bilan idempotent. O'chirilgan takrorlanish qayta yaratilmaydi; seriya o'chirilsa vazifalar oddiy vazifa bo'lib qoladi (SET NULL). Qoida o'zgarganda `resetFutureOccurrences` faqat kelajakdagi `todo` larni o'chirib, generated_until ni orqaga suradi; bajarilgan/boshlanganlari tarix sifatida qoladi. Yaratgandan keyin `recomputeForTask` chaqiriladi (Q-031).
- **Oqibat:** S1-05 (CRUD) seriyani yaratish/o'zgartirishda `resetFutureOccurrences` + `materializeRecurrences` ni chaqirishi SHART.

## Q-036: Generatsiya server jarayonida, alohida cron/job emas
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-04)
- **Status:** qabul qilingan
- **Kontekst:** Materializatsiya qachon ishlashi kerak.
- **Qaror:** `apps/server/src/index.ts` da ishga tushganda va har soatda `materializeRecurrences` chaqiriladi. Lokal bitta foydalanuvchi uchun yetarli.
- **Rad etilgan:** alohida cron / job navbati.
- **Oqibat:** Server real ishga tushirib sinalmagan (faqat sinovlar va typecheck).

## Q-037: Biznes mantiq @loiha/db servis qatlamida, server faqat HTTP
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-05)
- **Status:** qabul qilingan
- **Kontekst:** CRUD tekshiruvlari va progress yangilash S1-12 dagi dashboard-mcp da ham kerak.
- **Qaror:** list/get/create/update/delete (goals, KR, tasks, recurrences, tags) `packages/db/src/planning.ts` da; xatolar `PlanningError` (not_found/invalid/conflict), server ularni 404/400/409 ga o'giradi. Har yozish o'z tranzaksiyasida `recompute*` bilan (Q-031 bajarildi).
- **Rad etilgan:** mantiqni Hono route'larida yozish (MCP bilan takrorlanardi).
- **Oqibat:** S1-12 MCP tool'lari planning.ts servislarini chaqirishi kerak.

## Q-038: Enum va API sxemalari @loiha/shared da
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-05)
- **Status:** qabul qilingan
- **Kontekst:** Web formalari ham bir xil qiymat va tekshiruvlarni ishlatadi.
- **Qaror:** GOAL_LEVELS/PLAN_LEVELS/GOAL_STATUSES/TASK_STATUSES, zod sxemalari va DTO'lar `packages/shared/src/planning.ts` da; db schema enum'larni re-export qiladi (bitta manba).

## Q-039: Maqsad ierarxiyasi qat'iy tekshiriladi, davr `date` bilan beriladi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-05)
- **Status:** qabul qilingan
- **Kontekst:** Noto'g'ri ota-bola bog'lanishi va sikllarni oldini olish kerak.
- **Qaror:** Ota darajasi bola darajasidan yuqori (sikl shu bilan istisno), bola davri ota davri ichida; davr o'zgarib bolalar tashqarida qolsa — 409. Darajani PATCH bilan o'zgartirib bo'lmaydi. API'da davr `date` (davr ichidagi istalgan sana) bilan beriladi, server `periodOf` bilan chegaraga keltiradi; vazifa rejasi `plan: {level, date}` → davr boshi.

## Q-040: Vazifada KR berilsa goal_id KR maqsadidan olinadi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-05)
- **Status:** qabul qilingan
- **Kontekst:** Vazifaning maqsadi va KR maqsadi mos bo'lishi kerak.
- **Qaror:** Vazifa/seriyada KR berilsa goal_id KR maqsadidan olinadi (mos kelmasa 400). KR o'chirilsa vazifalar maqsadning to'g'ridan-to'g'ri vazifalariga aylanadi. PATCH'da faqat maqsad o'zgarsa, boshqa maqsadga tegishli KR olib tashlanadi.

## Q-041: PATCH semantikasi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-05)
- **Status:** qabul qilingan
- **Kontekst:** Qisman yangilash qoidalarini belgilash kerak edi.
- **Qaror:** Maydon yo'q — o'zgarmaydi; null — tozalanadi. completed_at status done bo'lganda qo'yiladi, qayta ochilganda tozalanadi. tagIds — to'liq to'plam (almashtiriladi).

## Q-042: Seriya o'zgarganda kelajakdagi todo takrorlanishlar qayta yaratiladi; o'tmish yaratilmaydi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-05)
- **Status:** qabul qilingan
- **Kontekst:** Q-035 seriya o'zgarganda qayta yaratishni talab qildi; o'tmishdagi start_date "qarz" vazifalar to'plashi mumkin edi.
- **Qaror:** Seriya o'zgarganda/to'xtatilganda bugundan boshlab boshlanmagan (todo) takrorlanishlar qayta yaratiladi; o'chirilganda o'tganlari oddiy vazifa bo'lib qoladi. `materializeRecurrences(db, { from, until })` endi `from` (standart bugun) dan oldin vazifa yaratmaydi. Q-035 ni aniqlashtiradi.
- **Oqibat:** Ma'lum cheklov — qayta yaratilgan todo vazifalardagi qo'lda o'zgarishlar yo'qoladi. S1-06 list endpoint'larga davr filtri va daraxt so'rovlarini qo'shadi.

## Q-043: Davr filtri kesishuv (overlap) semantikasi bilan ishlaydi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-06)
- **Status:** qabul qilingan
- **Kontekst:** Maqsad va vazifalar turli davrlarda (yil/kvartal/oy/hafta/kun); "shu haftaning ro'yxati" uchun bitta qoida kerak edi.
- **Qaror:** Maqsad: `period_start <= end AND period_end >= start`. Vazifa rejasi davri so'ralgan oraliq bilan kesishsa kiradi (hafta ko'rinishida shu oyning oylik vazifalari ham chiqadi, oy ko'rinishida oy chegarasidan o'tgan hafta ham). Toraytirish uchun `planLevel`. SQL'da indeksga mos oddiy shartlar (haftalik: plan_start >= start-6, oylik: plan_start >= oy boshi).
- **Rad etilgan:** faqat davr ichida to'liq joylashganlar — oylik vazifalar hafta ko'rinishida yo'qolardi.
- **Oqibat:** S1-07…S1-09 UI va S1-12 MCP shu qoidadan foydalanadi.

## Q-044: Filtr kirishi — `period` kaliti yoki `from`/`to`
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-06)
- **Status:** qabul qilingan
- **Kontekst:** Filtrni bir ma'noli berish kerak.
- **Qaror:** `period` (Q-028 dagi periodKey formati) yoki `from`/`to` — ikkalasi birga berilsa 400. `status`, `level`, `planLevel` vergul bilan bir nechta qiymat qabul qiladi. Vazifalarda `unplanned=true` (inbox).

## Q-045: Maqsad daraxti xotirada quriladi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-06)
- **Status:** qabul qilingan
- **Kontekst:** `getGoalTree` ierarxiyani qaytarishi kerak.
- **Qaror:** Barcha maqsadlar bitta so'rov bilan olinib xotirada quriladi (bitta foydalanuvchi hajmi); filtr barcha tugunlarga qo'llanadi; otasi filtrdan o'tmagan maqsad ildiz bo'lib chiqadi; `rootId` berilsa ildiz doim kiradi; `seen` bilan sikldan himoya. `taskCounts` — maqsadga bog'langan (Q-040 bo'yicha KR orqali ham) bekor qilinmagan vazifalar {total, done}.
- **Rad etilgan:** rekursiv SQL CTE — murakkabroq, foyda yo'q.

## Q-046: Ro'yxat filtrlari `@loiha/shared` zod sxemalari bilan
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-06)
- **Status:** qabul qilingan
- **Kontekst:** Server va MCP bir xil tekshiruvdan o'tishi kerak.
- **Qaror:** `listGoalsQuerySchema`, `listTasksQuerySchema`, `goalTreeQuerySchema` shared'da; servis funksiyalari parse qilingan qiymatni qabul qiladi (S1-12 MCP ham shu sxemalardan o'tkazadi).
- **Oqibat:** Teg va matn bo'yicha qidiruv — S1-11.

## Q-047: Maqsadlar xaritasi bitta daraxt so'rovidan quriladi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-07)
- **Status:** qabul qilingan
- **Kontekst:** Yil/kvartal xaritasi joriy davr maqsadlarini va kichik davrlar ustunlarini ko'rsatadi.
- **Qaror:** `GET /api/goals/tree?period=…` dan bitta so'rov, UI'da tekislanadi: tepada joriy davr maqsadlari, pastda kichik davrlar ustunlari (yil → 4 kvartal, kvartal → 3 oy). Ota maqsad tanlovi uchun yuqori darajali maqsadlar ham shu javobda bor.
- **Oqibat:** S1-08 shu sahifaga Oy/Hafta tablarini qo'shadi va GoalSheet/GoalCard'ni qayta ishlatadi.

## Q-048: Ko'rinish holati URL search parametrlarida
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-07)
- **Status:** qabul qilingan
- **Kontekst:** Havola va orqaga tugmasi ishlashi kerak.
- **Qaror:** `view` (yil|kvartal) va `period` (Q-028 periodKey) URL'da. Darajasi mos kelmagan kalit ko'rinish darajasiga keltiriladi (kvartal + 2026 → joriy yoki 1-kvartal).

## Q-049: Tahrirlash o'ng panelda (Sheet), Radix Dialog qo'shilmadi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-07)
- **Status:** qabul qilingan
- **Kontekst:** Tahrirlashda xarita konteksti yo'qolmasligi kerak.
- **Qaror:** Alohida sahifa o'rniga o'ng panel; oddiy o'z komponentimiz (Esc/fon bosilsa yopiladi).
- **Rad etilgan:** Radix Dialog — yangi bog'liqlik kerak emas.

## Q-050: Ota maqsad tanlovi server qoidasini UI'da takrorlaydi
- **Sana:** 2026-10-19
- **Sprint:** S1 (S1-07)
- **Status:** qabul qilingan
- **Kontekst:** Server Q-039 qoidasini tekshiradi; foydalanuvchi noto'g'ri tanlov qilmasligi kerak.
- **Qaror:** Faqat darajasi yuqori va davri qamragan maqsadlar ko'rsatiladi; davr o'zgarsa mos kelmagan ota tozalanadi.

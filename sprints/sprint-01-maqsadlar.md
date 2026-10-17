---
id: S1
nomi: Maqsadlar va vazifalar tizimi
status: jarayonda
boshlanish: 2026-10-17
tugash: 2026-10-30
davomiylik: 2 hafta
---

# Sprint 1 — Maqsadlar va vazifalar tizimi

## Maqsad
Yillik → kvartal → oylik → haftalik → kunlik darajadagi maqsad va vazifalar tizimini qo'lda to'liq boshqarish imkoniyati. Claude bu ma'lumotlar bilan MCP orqali ishlay oladi.

## Vazifalar

### Ma'lumot modeli
- [x] **S1-01** Jadvallar: `goals` (daraja, ota maqsad, davr), `key_results`, `tasks`, `tags` — migratsiya `packages/db/drizzle/0001_s1_goals_tasks.sql`, 15 sinov o'tdi (default, UUID, CHECK, FK, kaskad/set null, updated_at); typecheck/lint/prettier toza. Qarorlar: Q-022…Q-026
- [x] **S1-02** Davr mantiqi: yil/kvartal/oy/hafta/kun chegaralari (ISO hafta) — `packages/shared/src/period.ts` va `period.test.ts`. Tekshirildi: `pnpm --filter @loiha/shared test` 15/15 sinov (9 suite) o'tdi; `pnpm typecheck` 7/7 muvaffaqiyatli; ESLint `._*` fayllarsiz 0 xato; Prettier manba fayllar toza. Qarorlar: Q-027…Q-029
- [x] **S1-03** Progress hisoblash: vazifalardan key result'ga, undan maqsadlarga yuqoriga yig'ilish — formulalar `packages/shared/src/progress.ts`, kesh yangilash `packages/db/src/progress.ts` (recomputeKeyResult/GoalUpwards/FromKeyResult/ForTask/AllProgress, sikllardan himoyalangan). Tekshirildi: shared 26/26, db 5/5 sinov; typecheck 7/7; lint 0 xato; format toza. Eslatma: S1-05 va S1-12 har yozishdan keyin `recompute*` ni chaqirishi shart. Qarorlar: Q-030…Q-032
- [ ] **S1-04** Takrorlanuvchi vazifalar (kunlik, haftalik, maxsus qoida)

### API
- [ ] **S1-05** Maqsad, key result va vazifalar uchun CRUD endpoint'lar
- [ ] **S1-06** Davr bo'yicha filtr va daraxt ko'rinishidagi so'rovlar

### UI
- [ ] **S1-07** Yillik va kvartal ko'rinishi (maqsadlar xaritasi)
- [ ] **S1-08** Oylik va haftalik ko'rinish (kanban + ro'yxat)
- [ ] **S1-09** Kunlik ko'rinish: "Bugun" sahifasi, fokus ro'yxati
- [ ] **S1-10** Drag-and-drop bilan vazifani kun/haftaga ko'chirish (dnd-kit)
- [ ] **S1-11** Ustuvorlik, teglar, qidiruv va tezkor qo'shish (Cmd+K)

### MCP
- [ ] **S1-12** dashboard-mcp tool'lari: `list_goals`, `get_goal_tree`, `create_task`, `update_task`, `update_progress`

## Qabul mezonlari (Definition of Done)
- Yillik maqsaddan kunlik vazifagacha bo'lgan zanjirni yaratish va ko'rish mumkin
- Vazifa bajarilganda yuqori darajadagi progress avtomatik yangilanadi
- Claude AI konsoldan "bu haftaning vazifalarini ko'rsat" so'roviga MCP orqali javob beradi

## Bog'liqliklar
- S0: DB, server, UI qobig'i, Claude runner

## Xavflar
- Ierarxiya juda murakkablashib ketishi mumkin → avval minimal model, keyin kengaytirish
- Jarayon: vibecoding plugin commit hook'i `.vibecoding/hisobot-ok` tasdiq faylini talab qiladi (gitignore'da); S0 commit'ida hujjatlar hisobotchi tomonidan yangilangani uchun fayl qo'lda yaratilgan
- Muhit (hal qilindi): Windows mashinaga Node.js 24.20.0 LTS (winget) va pnpm 12.11.2 (npm global) o'rnatildi, `pnpm install --frozen-lockfile` bilan node_modules Windows uchun qayta yig'ildi (`engines.node >=22.12` — mos)
- Muhit (hal qilindi, 2026-10-17): repoda macOS'dan qolgan AppleDouble `._*` fayllari `pnpm lint` (33 parsing xatosi) va `jarayon-sync` ni buzardi. Foydalanuvchi ruxsati bilan 551 ta `._*` fayl o'chirildi (hammasi `00 05 16 07` sarlavhasi bilan tekshirildi; 271 tasi `.git` ichida edi, `git fsck` toza). Natija: `pnpm lint` 0 xato, `pnpm format:check` toza, sync muvaffaqiyatli

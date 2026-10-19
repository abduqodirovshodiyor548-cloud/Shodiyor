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
- [x] **S1-04** Takrorlanuvchi vazifalar (kunlik, haftalik, maxsus qoida) — `packages/shared/src/recurrence.ts` (recurrenceRuleSchema/recurrenceSchema, occursOn, occurrencesBetween, describeRecurrence), `packages/db/src/recurrence.ts` (materializeRecurrences, resetFutureOccurrences), yangi `task_recurrences` jadvali, `tasks.recurrence_id` + `occurrence_date`, migratsiya `0002_s1_task_recurrences.sql` (ON DELETE set null qo'lda qo'shildi), server ishga tushganda va har soat generatsiya. Tekshirildi: shared 37/37, db 11/11 sinov; typecheck 7/7; lint 0 xato; format toza. Server real ishga tushirib sinalmagan. Eslatma: S1-05 seriya yaratish/o'zgartirishda `resetFutureOccurrences` + `materializeRecurrences` ni chaqirishi shart; S1-12 da `describeRecurrence` ishlatilishi mumkin. Qarorlar: Q-033…Q-036

### API
- [x] **S1-05** Maqsad, key result va vazifalar uchun CRUD endpoint'lar — `/api/goals`, `/api/key-results`, `/api/tasks`, `/api/recurrences`, `/api/tags` (`apps/server/src/routes/planning.ts`); mantiq servis qatlamida `packages/db/src/planning.ts` (`PlanningError` → 404/400/409), zod sxemalari va DTO `packages/shared/src/planning.ts`. Har yozish `recompute*` bilan (Q-031). Tekshirildi: shared 37/37, db 25/25 sinov; typecheck 7/7; lint 0; format toza; server real ishga tushirilib curl bilan sinaldi (yil→kvartal→KR→vazifa zanjiri, progress 0.5 yuqoriga yetdi, 400/404/409/204, haftalik seriya 6 vazifa). Qarorlar: Q-037…Q-042
- [x] **S1-06** Davr bo'yicha filtr va daraxt ko'rinishidagi so'rovlar — `GET /api/goals`, `/api/goals/tree`, `/api/tasks` ga `period` kaliti (2026, 2026-Q4, 2026-10, 2026-W43, 2026-10-19) yoki `from`/`to`, `status`/`level`/`planLevel` (vergul bilan ko'p qiymat), `unplanned=true` (inbox). `getGoalTree` (KR, taskCounts, ixtiyoriy vazifalar) `packages/db/src/planning.ts` da; zod sxemalari, `periodRange()` va `GoalTreeNode` `packages/shared/src/planning.ts` da. Tekshirildi: shared 37/37, db 35/35 (10 ta yangi: `planning-queries.test.ts`); typecheck 7/7; lint 0; format toza; server vaqtinchalik bazada real sinaldi (W43 kunlik+oylik reja chiqdi, kelasi hafta chiqmadi; daraxt 2026 → Q4 → W43; noto'g'ri kalit 400). Qarorlar: Q-043…Q-046

### UI
- [x] **S1-07** Yillik va kvartal ko'rinishi (maqsadlar xaritasi) — `apps/web/src/routes/goals/` (`GoalsPage`, `GoalCard`, `GoalSheet`, `labels.ts`), `apps/web/src/lib/planning.ts`; `/maqsadlar` (`view=yil|kvartal`, `period`), davr navigatsiyasi, yil: yillik maqsadlar + 4 kvartal ustuni, kvartal: maqsadlar + 3 oy ustuni; o'ng panelda maqsad/KR yaratish, tahrirlash, o'chirish. Tekshirildi: typecheck 7/7, lint 0, format toza; brauzerda alohida test bazasi bilan sinaldi (progress yangilanishi, KR inline tahriri, yaratish/o'chirish, 375px va qorong'i rejim, konsolda xato yo'q). Qarorlar: Q-047…Q-050
- [x] **S1-08** Oylik va haftalik ko'rinish (kanban + ro'yxat) — `/maqsadlar` da view=oy|hafta, mode=royxat|kanban; TaskViews.tsx (WeekList, MonthList, TaskBoard), TaskSheet.tsx; typecheck, lint va sinovlar o'tdi, brauzerda sinaldi
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
- Muhit: brauzer sinovi alohida DB bilan (`DATABASE_PATH`/`SERVER_PORT`/`WEB_PORT` env; config `.env` ni process.env ustidan yozmaydi). Preview ichida Vite stdin yopilganda jimgina ishlamay qoladi — stdin ochiq (pipe) qoldirilsa ishlaydi. `.claude/launch.json` dagi `jarayon` konfiguratsiyasi macOS yo'lini ko'rsatadi (Windows'da ishlamaydi) — o'zgartirilmadi

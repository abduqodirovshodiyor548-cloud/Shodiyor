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
- [ ] **S1-02** Davr mantiqi: yil/kvartal/oy/hafta/kun chegaralari (ISO hafta)
- [ ] **S1-03** Progress hisoblash: vazifalardan key result'ga, undan maqsadlarga yuqoriga yig'ilish
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

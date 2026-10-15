---
id: S4
nomi: Telegram assistent
status: rejalashtirilgan
boshlanish: 2026-12-07
tugash: 2026-12-18
davomiylik: 2 hafta
---

# Sprint 4 — Telegram assistent

## Maqsad
Dashboard'ning mobil interfeysi: Telegram orqali vazifa qo'shish, rejani ko'rish, bilim bazasidan so'rash va Claude bilan erkin muloqot.

## Vazifalar

### Bot asosi
- [ ] **S4-01** `apps/bot`: grammY, long polling, faqat ruxsat etilgan chat ID (whitelist)
- [ ] **S4-02** Bot va server o'rtasida ichki API (bitta DB, umumiy servislar)

### Buyruqlar
- [ ] **S4-03** `/today`, `/week`, `/goals` — rejani ko'rish
- [ ] **S4-04** `/add` va inline tugmalar bilan vazifani bajarildi deb belgilash
- [ ] **S4-05** Erkin matn → Claude (dashboard-mcp, kb, kalendar tool'lari bilan)
- [ ] **S4-06** Suhbat konteksti (Claude sessiyasini davom ettirish)

### Ovoz va fayllar
- [ ] **S4-07** Ovozli xabar → whisper.cpp → vazifa yoki eslatma
- [ ] **S4-08** Yuborilgan fayl va havolalarni bilim bazasiga qo'shish

### Avtomatik xabarlar
- [ ] **S4-09** Ertalabki brief (kun rejasi, kalendar, ustuvorliklar) — cron
- [ ] **S4-10** Kechki review va vazifa eslatmalari

## Qabul mezonlari (Definition of Done)
- Begona foydalanuvchi bot bilan ishlay olmaydi
- Ovozli xabar orqali qo'shilgan vazifa dashboard'da paydo bo'ladi
- Har kuni belgilangan vaqtda ertalabki brief keladi

## Bog'liqliklar
- S1, S2, S3: vazifalar, kalendar, bilim bazasi

## Xavflar
- Kompyuter uxlab qolsa bot ishlamaydi → S9'da launchd va "keep awake" yechimi
- whisper.cpp o'zbek tilini tanishi sifati → model tanlash testi

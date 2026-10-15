---
id: S2
nomi: AI rejalashtirish va kalendar
status: rejalashtirilgan
boshlanish: 2026-11-09
tugash: 2026-11-20
davomiylik: 2 hafta
---

# Sprint 2 — AI rejalashtirish va kalendar sinxronizatsiyasi

## Maqsad
Claude maqsadlarni kichik qadamlarga bo'lib, kun va haftani rejalashtiradi. Reja Google Calendar bilan ikki tomonlama sinxron bo'ladi.

## Vazifalar

### AI rejalashtirish
- [ ] **S2-01** "Maqsadni bo'lish": yillik maqsaddan kvartal, oy va hafta darajasigacha taklif
- [ ] **S2-02** "Bugungi reja": vazifalar, kalendar bandligi va ustuvorlik asosida kun rejasi
- [ ] **S2-03** Haftalik review: nima bajarildi, nima ko'chiriladi, xulosa
- [ ] **S2-04** AI takliflarini qabul qilish/rad etish UI'i (diff ko'rinishida)

### Google Calendar
- [ ] **S2-05** Google OAuth (lokal redirect), tokenlarni xavfsiz saqlash
- [ ] **S2-06** Kalendar event'larini o'qish va UI'da ko'rsatish (FullCalendar)
- [ ] **S2-07** Vaqt bloki berilgan vazifa → kalendar event'i (eventId mapping)
- [ ] **S2-08** Kalendardagi o'zgarishlarni qaytarib olish (syncToken, 5 daqiqalik polling)
- [ ] **S2-09** Konfliktlarni hal qilish qoidalari va sinxronizatsiya logi

### MCP
- [ ] **S2-10** Claude uchun kalendar tool'lari (Google Calendar MCP ulash yoki o'zimizniki)

## Qabul mezonlari (Definition of Done)
- "Bugungi reja" tugmasi bilan Claude kunni rejalashtiradi va bloklar kalendarda paydo bo'ladi
- Google Calendar'da event surilsa, dashboard'da vazifa vaqti ham yangilanadi
- Ikki tomonlama o'zgarishda dublikat event yaratilmaydi

## Bog'liqliklar
- S1: maqsad va vazifalar modeli
- Google Cloud loyihasi va OAuth client ID

## Xavflar
- Sinxronizatsiya konfliktlari — eng ko'p xato chiqadigan joy, testlar uchun vaqt ajratilsin
- Public URL yo'qligi sababli webhook ishlatib bo'lmaydi → polling

---
id: S7
nomi: Video montajchi — asos
status: rejalashtirilgan
boshlanish: 2027-01-18
tugash: 2027-01-29
davomiylik: 2 hafta
---

# Sprint 7 — Video montajchi (asos)

## Maqsad
Xom videoni transkripsiya qilish, Claude yordamida kesish rejasini (EDL) tuzish va FFmpeg bilan render qilish.

## Vazifalar

### Media
- [ ] **S7-01** Video yuklash, lokal media papkasi, metadata (ffprobe)
- [ ] **S7-02** Preview uchun proxy fayl va thumbnail'lar
- [ ] **S7-03** whisper.cpp bilan so'z darajasidagi vaqtli transkripsiya

### AI montaj
- [ ] **S7-04** EDL JSON sxemasi (segmentlar, olib tashlanadigan joylar, sabablar)
- [ ] **S7-05** Claude: transkript → pauza, xato va takrorlarni olib tashlash
- [ ] **S7-06** Claude: highlight'larni tanlash (qisqa klip uchun)
- [ ] **S7-07** FFmpeg render job'i (progress bilan, fon rejimida)

### UI
- [ ] **S7-08** Transkript asosidagi tahrir: matnni o'chirish = videodan kesish
- [ ] **S7-09** Timeline preview va render natijasini ko'rish

## Qabul mezonlari (Definition of Done)
- 10 daqiqalik videodan pauzalar va xatolar olib tashlangan versiya avtomatik chiqadi
- Foydalanuvchi transkriptda segmentni qayta tiklay oladi va qayta render qiladi

## Bog'liqliklar
- S0: job navbati; S4: whisper.cpp integratsiyasi

## Xavflar
- Render og'ir → bir vaqtda 1 ta render, proxy fayllar bilan preview

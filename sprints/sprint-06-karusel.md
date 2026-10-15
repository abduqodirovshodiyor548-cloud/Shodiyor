---
id: S6
nomi: Karusel yaratuvchi
status: rejalashtirilgan
boshlanish: 2027-01-04
tugash: 2027-01-15
davomiylik: 2 hafta
---

# Sprint 6 — Karusel post yaratuvchi

## Maqsad
Instagram/LinkedIn uchun karusel postlar (PNG seriyasi) yaratish. Claude g'oya va matnni yozadi, shablonlar orqali rasm sifatida render qilinadi.

## Vazifalar

### Pipeline
- [ ] **S6-01** Karusel JSON sxemasi (hook slayd, kontent slaydlar, CTA)
- [ ] **S6-02** Brend sozlamalari: ranglar, shriftlar, logo, handle
- [ ] **S6-03** JSX shablonlar kutubxonasi (kamida 5 ta)
- [ ] **S6-04** Satori + resvg bilan PNG render (1080×1350 va 1080×1080)
- [ ] **S6-05** Claude: g'oya → bir nechta variant (hook, struktura, caption, hashtaglar)

### UI
- [ ] **S6-06** "Karusel" sahifasi: variantlar, preview, slaydni tahrirlash
- [ ] **S6-07** ZIP eksport va caption'ni nusxalash
- [ ] **S6-08** Kontent rejasi: karuselni haftalik vazifa/kalendarga bog'lash

## Qabul mezonlari (Definition of Done)
- Bitta g'oyadan 3 ta variant chiqadi, tanlangani PNG ZIP sifatida yuklanadi
- O'zbek harflari (oʻ, gʻ) shriftlarda to'g'ri chiqadi

## Bog'liqliklar
- S5: render infratuzilmasi va brend mavzulari

## Xavflar
- Satori CSS'ni to'liq qo'llab-quvvatlamaydi → shablonlarni flexbox doirasida yozish

---
id: S5
nomi: Taqdimot yaratuvchi
status: rejalashtirilgan
boshlanish: 2026-12-21
tugash: 2027-01-01
davomiylik: 2 hafta
---

# Sprint 5 — Taqdimot yaratuvchi

## Maqsad
Mavzu va materialdan tayyor taqdimot (PPTX/PDF) yaratadigan instrument. Claude struktura va matnni yozadi, tizim uni brend dizaynida render qiladi.

## Vazifalar

### Pipeline
- [ ] **S5-01** Slayd JSON sxemasi (sarlavha, bullet, rasm, diagramma, iqtibos, raqamlar)
- [ ] **S5-02** Claude: mavzu → reja → slayd JSON (bilim bazasidan material bilan)
- [ ] **S5-03** HTML slayd renderer va mavzular (brend ranglari, shriftlar)
- [ ] **S5-04** PPTX eksport (pptxgenjs)
- [ ] **S5-05** PDF eksport (Playwright)

### UI
- [ ] **S5-06** Instrumentlar bo'limi va "Taqdimot" sahifasi
- [ ] **S5-07** Slayd preview va qo'lda tahrirlash
- [ ] **S5-08** Bitta slaydni AI bilan qayta yozish ("qisqaroq", "ko'proq raqam")
- [ ] **S5-09** Taqdimotlar tarixi va qayta ochish

## Qabul mezonlari (Definition of Done)
- Bitta prompt bilan 8–12 slaydli taqdimot yaratiladi
- PPTX PowerPoint/Keynote'da buzilmasdan ochiladi
- Slaydni alohida qayta generatsiya qilish mumkin

## Bog'liqliklar
- S0: Claude runner; S3: bilim bazasi (material manbasi)

## Xavflar
- HTML va PPTX ko'rinishi farq qilishi → slayd sxemasini cheklangan layout'lar bilan ushlab turish

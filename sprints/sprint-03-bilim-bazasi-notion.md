---
id: S3
nomi: Bilim bazasi va Notion
status: rejalashtirilgan
boshlanish: 2026-11-23
tugash: 2026-12-04
davomiylik: 2 hafta
---

# Sprint 3 — Bilim bazasi va Notion integratsiyasi

## Maqsad
Shaxsiy bilim bazasi (hujjatlar, eslatmalar, Notion sahifalari) va Notion bilan ikki tomonlama ishlash. Claude bilim bazasidan qidirib javob bera oladi.

## Vazifalar

### Bilim bazasi
- [ ] **S3-01** Jadvallar: `kb_documents`, `kb_chunks`, FTS5 indeks
- [ ] **S3-02** Ingest: Markdown, PDF, URL, oddiy matn → bo'laklarga ajratish
- [ ] **S3-03** Qidiruv API (FTS5, rank, manba havolasi bilan)
- [ ] **S3-04** Bilim bazasi UI: hujjatlar ro'yxati, ko'rish, teglar, yuklash
- [ ] **S3-05** dashboard-mcp: `kb_search`, `kb_get_document`, `kb_add_note` tool'lari

### Notion
- [ ] **S3-06** Notion integratsiyasi: token sozlash, ulanishni tekshirish
- [ ] **S3-07** Notion sahifalarini bilim bazasiga import qilish (tanlangan sahifa/DB)
- [ ] **S3-08** Maqsad va vazifalarni Notion database bilan sinxronlash (`@notionhq/client`)
- [ ] **S3-09** Notion MCP'ni Claude profillariga ulash (AI orqali sahifa yaratish/tahrirlash)

### Semantik qidiruv (ixtiyoriy)
- [ ] **S3-10** sqlite-vec + lokal embedding (transformers.js) bilan gibrid qidiruv

## Qabul mezonlari (Definition of Done)
- PDF yoki URL qo'shilgandan keyin AI konsolda u haqida savol berilsa, manbasi bilan javob qaytadi
- Dashboard'dagi vazifa Notion DB'da ko'rinadi va aksincha
- Claude Notion'da yangi sahifa yarata oladi

## Bog'liqliklar
- S1: vazifalar modeli (Notion sinxronizatsiyasi uchun)

## Xavflar
- Notion API rate limitlari → navbat va backoff
- Katta PDF'lar → ingest job sifatida fon rejimida

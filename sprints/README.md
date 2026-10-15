# Sprintlar

Loyiha 10 ta sprintga bo'lingan (S0 — 1 hafta, qolganlari — 2 haftadan). Har bir sprint alohida faylda.

| Sprint | Nomi | Fayl |
|---|---|---|
| S0 | Poydevor | [sprint-00-poydevor.md](sprint-00-poydevor.md) |
| S1 | Maqsadlar va vazifalar tizimi | [sprint-01-maqsadlar.md](sprint-01-maqsadlar.md) |
| S2 | AI rejalashtirish va kalendar | [sprint-02-kalendar.md](sprint-02-kalendar.md) |
| S3 | Bilim bazasi va Notion | [sprint-03-bilim-bazasi-notion.md](sprint-03-bilim-bazasi-notion.md) |
| S4 | Telegram assistent | [sprint-04-telegram.md](sprint-04-telegram.md) |
| S5 | Taqdimot yaratuvchi | [sprint-05-taqdimot.md](sprint-05-taqdimot.md) |
| S6 | Karusel yaratuvchi | [sprint-06-karusel.md](sprint-06-karusel.md) |
| S7 | Video montajchi — asos | [sprint-07-video-asos.md](sprint-07-video-asos.md) |
| S8 | Video montajchi — kengaytma | [sprint-08-video-kengaytma.md](sprint-08-video-kengaytma.md) |
| S9 | Sayqal va barqarorlik | [sprint-09-sayqal.md](sprint-09-sayqal.md) |

Boshqa fayllar:
- [QARORLAR.md](QARORLAR.md) — yo'l-yo'lakay qabul qilingan qarorlar jurnali
- [hisobotlar/](hisobotlar/) — har bir sprint yakunidagi hisobotlar
- [../jarayon.html](../jarayon.html) — jarayon dashboardi (brauzerda oching)

## Fayl formati (hisobotchi agent va sinxron skript shunga tayanadi)

Har bir sprint fayli boshida frontmatter bo'ladi:

```
---
id: S0
nomi: Poydevor
status: rejalashtirilgan     # rejalashtirilgan | jarayonda | yakunlangan | to'xtatilgan
boshlanish: 2026-10-19
tugash: 2026-10-23
davomiylik: 1 hafta
---
```

Vazifalar `## Vazifalar` bo'limida, `###` sarlavhalar bilan guruhlanadi. Har bir vazifa:

```
- [ ] **S0-01** Vazifa nomi
```

Belgilar:

| Belgi | Status |
|---|---|
| `[ ]` | rejalashtirilgan |
| `[/]` | jarayonda |
| `[x]` | bajarildi |
| `[!]` | bloklangan |
| `[-]` | bekor qilindi |

Fayl o'zgargandan keyin dashboard ma'lumotini yangilash:

```bash
node scripts/jarayon-sync.mjs
```

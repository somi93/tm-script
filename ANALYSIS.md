# Codebase Analysis — TMScripts

> Generated: March 14, 2026 | Scope: 40+ files | Severity: 8 critical, 12 high, 9 medium, 4 low

---

## 🚨 CRITICAL (Quick Wins)

### 1. ACTION_LABELS & ACTION_CLS duplirani u 3 fajla
- **Fajlovi**: `tm-match-statistics.js`, `tm-match-lineups.js`, `tm-match-dialog.js`
- **Problem**: Identični objekti kopirani u svaki fajl
- **Fix**: Prebaci u `TmConst` (`tm-constants.js`), importuj svuda

### 2. posOrder mapa duplirana
- **Fajlovi**: `tm-match-statistics.js`, `tm-match-lineups.js`
- **Problem**: `POSITION_MAP` već postoji u `tm-constants.js` — trostruka redundancija
- **Fix**: Napravi `TmUtils.getPositionOrder()` ili koristi `POSITION_MAP` direktno

### 3. ratingColor() reimplementirana lokalno
- **Fajl**: `tm-match-lineups.js` ~L411-432
- **Problem**: Već postoji u `tm-utils.js` kao `TmUtils.ratingColor`
- **Fix**: Obriši lokalnu kopiju, importuj iz utils

### 4. r5Color() — 50+ linija HSL kalkulacije u UI komponenti
- **Fajl**: `tm-match-lineups.js` L433-485
- **Problem**: Kompleksna color logika koja se računa na svaki render bez keširanja
- **Fix**: Izvuci u `TmUtils`, dodaj `Map` cache za performance

### 5. var/let nekonzistentnost
- **Fajl**: `tm-history-matches.js` L262-329
- **Problem**: ES5 `var` pomešan sa `let` u async loop-u
- **Fix**: Prebaci sve na `const`/`let`

### 6. render() monolit — 290 linija
- **Fajl**: `tm-match-statistics.js`
- **Problem**: Jedna funkcija radi sve — header, stats, attacking styles, player stats, events
- **Fix**: Razbij na 5 funkcija

---

## 📌 HIGH PRIORITY

### 7. Fajlovi preveliki
| Fajl | Linija | Predlog |
|------|--------|---------|
| `tm-match-lineups.js` | 650+ | Split: render, events, pitch, handlers |
| `tm-history-matches.js` | 400+ | Split po odgovornosti |
| `tm-league-fixtures.js` | Prevelik | Split |

### 8. Promise error handling nedostaje
- **Fajlovi**: `tm-match-analysis.js`, `tm-match-lineups.js`, league fajlovi
- **Problem**: `Promise.all()` bez `.catch()` — loading spinner zauvek ako API failuje
- **Fix**: Dodaj `.catch()` sa `TmUI.error()` porukama

### 9. TmRender.render() postoji ali se ne koristi
- **Problem**: 1000+ `html +=` statement-a širom codebase-a
- **Fix** (postepeno): Zameni sa template literal-ima ili `TmRender`

### 10. CSS klase nekonzistentne
- **Prefixe**: `rnd-`, `tmu-`, `tmh-`, `tms-` — nema jasne konvencije
- **Fix**: Standardizuj na `[component]-[element]-[variant]`

### 11. Inconsistent option passing
- **Problem**: Svaka komponenta očekuje drugačiji oblik `opts` objekta
- **Fix**: Definisati zajedničke option objekte

### 12. Video classification logika duplirana
- **Fajlovi**: `tm-match-utils.js`, `tm-match-statistics.js`, `tm-match-lineups.js`
- **Fix**: Napravi `tm-video-classifier.js` modul

---

## 🟡 MEDIUM PRIORITY

### 13. buildPlayerNames() i isEventVisible() na pogrešnom mestu
- **Problem**: Definisani u `pages/match.js` a koriste se u više komponenti
- **Fix**: Prebaci u `lib/`

### 14. HTML string concatenation anti-pattern
- **Problem**: 50+ fajlova koristi `html +=` umesto structured rendering-a
- **Fix**: Template literals kao prvi korak, `TmRender` dugoročno

### 15. Nema dokumentacije import hijerarhije
- **Problem**: Rizik od circular dependencies kako projekat raste
- **Fix**: Dokumentovati: `pages/ → components/ → lib/ → constants`

### 16. Inconsistent data transformation patterns
- **Problem**: Direct object building, Map accumulation, inline accumulation — tri različita pristupa
- **Fix**: Standardizovati pattern

---

## ✅ Šta je dobro

- **API apstrakcija** (`tm-services.js`) — all-resolve pattern sprečava crash
- **Nema circular dependencies** — import disciplina je dobra
- **`tm-constants.js`** — sve game konstante na jednom mestu
- **Shared komponente** — 11 sub-components čisto razdvojenih
- **IndexedDB layer** (`tm-playerdb.js`) — enkapsuliran
- **Async patterns** — `Promise.all` korišćen na pravim mestima

---

## Prioritetna matrica

```
              │  Lak (~15-45 min)  │  Srednji (~2-3h)         │  Težak (~4h+)
──────────────┼────────────────────┼──────────────────────────┼──────────────────────────
Visok efekat  │  #1 ACTION_LABELS  │  #6 split statistics     │  #7 split lineups
              │  #2 posOrder       │  #8 error handling       │     (650→4×150)
              │  #3 ratingColor    │                          │
              │  #4 r5Color        │                          │
──────────────┼────────────────────┼──────────────────────────┼──────────────────────────
Srednji       │  #5 var→const/let  │  #12 video classifier    │  #9 HTML concat→templates
efekat        │  #10 CSS naming    │  #13 move shared funcs   │  #14 full TmRender adopt
──────────────┼────────────────────┼──────────────────────────┼──────────────────────────
Nizak efekat  │  #15 arch docs     │  #16 data transform std  │  #11 option types
```

---

## Import hijerarhija (ciljana)

```
pages/  →  components/  →  lib/  →  constants
              shared/

Nikad obrnuti import!
```

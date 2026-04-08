# Tactics System Rewrite — TODO

## Problem sa starim sistemom

- **Duplo stanje**: `fieldByPos` (posIndex→pid) + `assoc` (posKey→pid) mora se ručno sinhronizovati svugdje — jedan propust = bug
- **Dinamičan grid**: `getVisualCols(count)` računa kolone svaki put ovisno o broju igrača
- **Krhak `positions[]` array**: 24-slot indeksiran niz, sva logika ovisi o tačnom indeksu
- **Race condition za R5**: tooltip fetch za svakog igrača, Pick Best 11 preskakao igrače čiji tooltip nije stigao
- **`pickBest11` za autocomplete**: primao `positions[]` array direktno → destructure greška, R5 = 0, igrači nasumični

---

## Novo rješenje

### Princip: jedno stanje, fiksni grid

- **`assignment`** = `{ posKey → pid }` — jedini izvor istine za sve dodjele (teren + bench + special)
- **`activeKeys`** = `Set<posKey>` — koji posjkeyevi su aktivni u trenutnoj formaciji
- **`FIELD_ZONES`** — konstanta, svaka zona ima 5 col-slotova (null gdje nema pozicije): rendering nikad ne računa kolone dinamički
- **`row`, `col`** u svakom POSITION_MAP entriju — fiksna pozicija u 6×5 gridu

---

## Zadaci

### ✅ 1. `src/constants/player.js`
- Dodati `row` i `col` svakom entryju u POSITION_MAP
- Dodati export `FIELD_ZONES` — array zona FWD→GK, svaka zona `{ key, row, cols: [posKey|null, ...5] }`
- Dodati export `BENCH_SLOTS`, `SPECIAL_SLOTS`, `BENCH_LABELS`

### ✅ 2. `src/pages/tactics.js`
- Import `TmPlayerDB`
- Inicijalizovati DB paralelno sa `fetchTacticsData`
- Za svakog igrača: `normalizePlayer(p, TmPlayerDB.get(pid), { skipSync: true })` odmah (sinhronski iz DB, bez requesta)
- Fetch tooltip SAMO za igrače bez `allPositionRatings` nakon DB normalizacije
- Odmah pozvati `lineupApi.refresh()` i `panelApi.refreshStats()` nakon DB normalizacije (instant prikaz za DB igrače)

### ✅ 3. `src/components/tactics/tm-tactics-lineup.js` — FULL REWRITE
**Novo stanje:**
```
assignment = { ...data.formation_assoc }  // posKey/benchRole → pid
activeKeys = new Set(positions.filter(Boolean))  // aktivne pozicije formacije
```

**Renderovanje terena:**
- 6 zona × 5 kolona — uvijek fiksnih 5 kolona po zoni
- Zona se prikazuje samo ako ima ≥1 aktivne posKey
- Za svaku kolonu: ako je posKey u activeKeys → slot (popunjen ili ghost), inače → spacer

**Normalizacija:**
```
normalizeZone(zoneKey):
  - uzme sve activePosKeys u zoni (L→R)
  - nađe occupied (koji imaju assignment)
  - preraspodijeli symmetrično pomoću getTargetRanks(total, count)
  - re-rendera promijenjene slotove
```

**Drag & drop (simplified):**
```
assignTo(pid, targetPosKey):
  - clearSourceOldSpot(pid)
  - displace existing occupant to source slot
  - assignment[targetPosKey] = pid
  - normalizeZone(affected rows)
```

**Novi external API:**
```js
{ refresh, applyAssignment, getAssignment, getActiveKeys, subscribe }
```
Gdje:
- `getAssignment()` — kopija assignment (za panel)
- `getActiveKeys()` — kopija activeKeys (Set)
- `applyAssignment(newAssignment, newActiveKeys?)` — za Pick Best 11 i promjenu formacije

### ✅ 4. `src/components/tactics/tm-tactics-panel.js`
- `getFormationName` — koristi `getActiveKeys()` + `getAssignment()`
- `computeStats` — iterira po activeKeys, čita assignment
- `pickBest11(activeKeys, players_by_id)` — prima Set umjesto activeSlots array, vraća `{ posKey → pid }`
- Autocomplete: `newActiveKeys = new Set(FORMATION_PRESETS[name].filter(Boolean))` → `pickBest11(newActiveKeys, ...)` → `applyAssignment(newAssignment, newActiveKeys)`
- Subs: isti `pickBestSub` po favposition grupama

### ✅ 5. `src/components/tactics/tm-tactics-styles.js`
- Provjera da `.tmtc-line` stil radi s fiksnim 5-col layoutom (nebi trebalo ništa mijenjati)

### ✅ 6. Build & test

---

## Neizmijenjeni fajlovi
- `tm-tactics-orders.js`
- `tm-tactics-settings.js`
- `src/lib/tm-constants.js` (samo re-exportuje)
- Sve services osim eventualnog dodavanja DB init

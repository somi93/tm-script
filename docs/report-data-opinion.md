# Match Report Structure — My Take

## Šta korisnik vidi (complete inventory)

1. **Live text feed** — commentary po linijama, grupisan po video klipu, progresivno se otkriva
2. **Unity 3D viewport** — animira klipove po minutu, svaki klip = jedan segment šanse
3. **Score header** — live rezultat, ažurira se kad padne gol
4. **Stat bars** — Possession, Shots, On Target, Yellows, Reds, Set Pieces, Penalties (tim vs tim)
5. **Attacking styles tabla** — po stilu: Attacks / Lost / Shot / Goal / Conv% — klikni za listu šansi
6. **Player stats tabla** — po igraču: Min, Passes ok/fail, Crosses ok/fail, Shots/Saves, G, A, Duels W/L, Rating — klikni za event listu
7. **Player dialog** — Shooting (Goals, Shots, On Target, Foot G, Head G), Passing (Assists, Key Pass, Pass%, Cross%), Defending (INT, TKL, HC, TF, Fouls), event timeline
8. **Lineup grid** — pitch pozicije sa event ikonama (⚽ 👟 🟨 🟥 ✚ 🔼 🔽), rating
9. **Unity mini-stats** — real-time Shots/On Target/Goals/Yellow/Red/Set Pieces bar tokom replay-a

---

## Moj predlog

```js
report = {
  "23": {
    plays: [
      {
        team: 123,
        style: "fl",              // attacking style key — "fl", "tb", "cnt", "dire"...
        outcome: "goal",          // "goal" | "shot" | "lost"

        segments: [
          // ── Buildup ──
          { clip: "pass1",
            text: ["R. Lacmanović looks up", "He plays a through ball to M. Perić"],
            actions: [
              { action: "pass", result: "ok", by: 456, to: 789 },
              { action: "keyPass", by: 456 },
            ] },

          { clip: "cross2",
            text: ["M. Perić whips in a cross from the right"],
            actions: [
              { action: "cross", result: "ok", by: 789 },
              { action: "keyPass", by: 789 },
            ] },

          // ── Defensive actions ──
          { clip: "defwin3",
            text: ["D. Jović slides in with a tackle"],
            actions: [
              { action: "tackle", by: 333 },
              { action: "duelWon", by: 333 },
            ] },

          { clip: "defwin1",
            text: ["D. Jović reads the play and intercepts"],
            actions: [
              { action: "interception", by: 333 },
              { action: "duelWon", by: 333 },
            ] },

          // ── Run duel — multiple players in one clip ──
          { clip: "finrun1",
            text: ["N. Simić and K. Marić both fail to stop the run"],
            actions: [
              { action: "duelLost", by: 444 },
              { action: "duelLost", by: 555 },
              { action: "tackleFail", by: 444 },
            ] },

          // ── Foul + card ──
          { clip: "foulcall",
            text: ["N. Simić brings him down"],
            actions: [
              { action: "foul", by: 444 },
            ] },
          { clip: "yellow1",
            text: ["The referee shows a yellow card"],
            actions: [
              { action: "card", type: "yellow", player: 444 },
            ] },

          // ── Finish ──
          { clip: "header1",
            text: ["M. Perić rises highest", "He plants a header — GOAL!"],
            actions: [
              { action: "finish", result: "goal", by: 789, gk: 111, method: "head" },
            ] },

          // ── Save ──
          { clip: "save1",
            text: ["The keeper dives but can't reach it"],
            actions: [
              { action: "save", by: 111 },
            ] },

          // ── Substitution ──
          { clip: "sub1",
            text: ["Substitution — N. Simić is replaced by A. Marić"],
            actions: [
              { action: "sub", playerIn: 234, playerOut: 567 },
            ] },
        ],
      }
    ],
  }
}
```

---

## Zašto baš ovo

### 1. Sve je segment

Svaki clip koji Unity animira = jedan segment. Nema odvojenih `cards[]`, `subs[]`, `injuries[]` nizova — karton je segment sa `action: "card"`, izmjena je segment sa `action: "sub"`. Uvijek postoji clip za te stvari u igri.

Prednosti:
- **Tačan timing.** Lineup ikona (🟨) se ažurira tačno kad Unity prikaže clip kartona, ne na početku minute
- **Jedan prolaz.** Stats, lineup update, text — sve se čita iz istog niza
- **Nema filtriranja.** Consumer ne mora da skipuje "non-play" evente jer ih nema

### 2. `text[]` na segmentu

Tekst je vezan za clip — kad Unity javi `starting_clip`, prikažemo sve linije iz `text[]` tog segmenta odjednom. Jedan clip = jedan segment = jedan text blok (koji može imati više linija).

Nema paralelnih nizova. Nema pitanja "koji text pripada kojem segmentu".

### 3. `clip` i `actions[]` — razdvojene odgovornosti

`clip` je za Unity — koji video da pusti. Unity dobija: `play.segments.map(s => s.clip)`

`actions[]` je za stats — šta se desilo u tom clipu. Jedan clip može nositi više akcija:
- Pas koji je ujedno keyPass
- Defwin koji je tackle + duelWon
- Finrun gdje dva igrača gube duel + tackle fail

Stats akumulacija:
```js
for (const seg of play.segments)
  for (const a of seg.actions)
    switch (a.action) {
      case "pass": a.result === "ok" ? p.passesCompleted++ : p.passesFailed++; break;
      case "keyPass": p.keyPasses++; break;
      case "tackle": p.tackles++; break;
      case "duelWon": p.duelsWon++; break;
      case "duelLost": p.duelsLost++; break;
      // ...
    }
```

Nema regex-a, nema lookup-a, nema text parsiranja za klasifikaciju.

### 4. Kompletna action paleta

| action | polja | šta deriviramo |
|---|---|---|
| `pass` | `by`, `to`, `result` | passesCompleted/Failed |
| `cross` | `by`, `result` | crossesCompleted/Failed |
| `keyPass` | `by` | keyPasses |
| `finish` | `by`, `gk`, `result`, `method` | shots, shotsOnTarget/Off, goalsFoot/Head |
| `tackle` | `by` | tackles |
| `interception` | `by` | interceptions |
| `headerClear` | `by` | headerClearances |
| `duelWon` | `by` | duelsWon |
| `duelLost` | `by` | duelsLost |
| `tackleFail` | `by` | tackleFails |
| `save` | `by` | saves |
| `foul` | `by` | fouls |
| `card` | `player`, `type` | yellowCards, redCards |
| `sub` | `playerIn`, `playerOut` | lineup update |
| `injury` | `player` | lineup update |
| `gkKick` | `by`, `result` | passesCompleted/Failed (GK) |
| `gkThrow` | `by`, `result` | passesCompleted/Failed (GK) |

### 5. `by` / `to` / `gk` — semantičke uloge

`att1` je ime slota u videu, ne semantička uloga. Sa `by` (ko vrši akciju) i `to` (kome), consumer ne mora dekodovati:
- `{ action: "pass", by: 456, to: 789 }` — 456 je pasirao, 789 primio
- `{ action: "tackle", by: 333 }` — 333 je uradio tackle
- `{ action: "finish", by: 789, gk: 111 }` — 789 je šutirao, 111 je golman

Za `card`/`sub`/`injury` — polja su specifična za tip (`player`, `playerIn`/`playerOut`).

### 6. `outcome` na play-u

`outcome: "goal"` je brzi filter — `plays.filter(p => p.outcome === 'goal')` bez skeniranja segmenata/akcija.

### 7. Minute-keyed

Unity adresira po `(minute, playIndex)`. Flat array bi zahtijevao `filter(e => e.min === 45)` svaki put.

---

## Šta ovo znači za normalizaciju

`normalizeReport(rawReport, lineup)` funkcija koja:
1. Iterira minute
2. Za svaki event: parsira `type` prefix → `style`, mapira clip kode → `actions[]`
3. Izvlači semantičke uloge (`by`/`to`) iz `att1`/`att2`/`def1`/`def2` zavisno od tipa akcije
4. Dodaje implicitne akcije — `keyPass` za pas/centar koji vodi do šuta, `duelWon` uz tackle/interception
5. Za finrun: kreira akciju za svakog igrača (`def1` i `def2`)
6. Resolveuje `[player=456]` tagove u tekstu u imena
7. Računa `outcome` iz akcija

Rezultat: **jednom se parsira, svugdje se čita čisto.**

---

## Player tagovi → resolveovati u ime tokom normalizacije

Tekst u feedu je čisto vizuelni prikaz — korisnik ga čita, ne klikće na njega. Player dialog se otvara iz lineup grida ili player tabele. Normalizacija već ima pristup lineup objektu — resolucija imena se radi tu, jednom. Player ID-evi su dostupni preko `by`/`to`/`gk`/`player` polja u `actions[]`.

---

## Šta ovo NE mijenja

- Minute-keyed organizacija ostaje ista
- Unity i dalje koristi originalne clip kodove (`segments.map(s => s.clip)`)
- Commentary text sadrži resolveovana imena — player ID-evi su u actions
- Ista informacija — samo čistiji oblik

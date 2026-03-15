# Match Report Data Design

## Context — šta UI zapravo prikazuje

Sve opcije su evaluirane prema sledećim potrebama:

| Feature | Šta treba iz reporta |
|---|---|
| **Live text feed** | Commentary linije, po grupe po klipu, adresabilne po `(min, playIdx, lineIdx)` |
| **Unity 3D sync** | Video clip kodovi + player assignment po segmentu, grupisanje teksta = jedan group per klip |
| **Stat bars** | `goal`, `shot`, `yellow`, `red`, `sub`, `set_piece`, ukupni brojači |
| **Attacking styles** | Attack stil prefix + outcome (goal/shot/lost) po napadu |
| **Player stats table** | Action tip po segmentu + koje igrači u kojoj ulozi (passer, shooter, defender...) |
| **Player dialog** | Isto što i gore + tačni minuti za sub_in / sub_out |
| **Lineup events** | `goal`, `yellow`, `red`, `sub`, `injury` po igraču |
| **Score header** | `goal.scorer`, kuji tim je dao gol |

---

## Opcija 1 — Flat chronological array

```json
[
  { "min": 23, "kind": "play",   "team": 123, "style": "fl", "outcome": "shot", ... },
  { "min": 45, "kind": "yellow", "player": 456 },
  { "min": 45, "kind": "play",   "team": 789, "style": "tb", "outcome": "goal", ... },
  { "min": 67, "kind": "sub",    "in": 234, "out": 456 }
]
```

**Pros:**
- Najjednostavnija struktura, nema nestanja
- Lako slicovati do određenog trenutka (binary search po `min`)
- Prirodan event log format

**Cons:**
- Live replay i Unity trebaju grouping po minutu — svaki put trebaš `O(n)` prolaz da skupiš sve evente za minut `45`
- Unity addressing je `(min, idx_within_minute)` — sa flat listom moraš reindeksirati
- `min` se ponavlja za svaki event — redundantno
- Miješaju se `play` i `yellow`/`sub` tipovi — svaki consumer mora `if kind === 'play'`

---

## Opcija 2 — Minute-keyed, flat mixed array

```json
{
  "45": [
    {
      "kind": "play",
      "team": 123,
      "style": "fl",
      "outcome": "goal",
      "goal":    { "scorer": 789, "assist": 456 },
      "shot":    { "onTarget": true },
      "penalty": false,
      "segments": [
        { "clip": "pass1",    "att1": 456, "att2": 789 },
        { "clip": "header1",  "att1": 789, "gk": 111 }
      ],
      "commentary": [
        ["456 plays the ball to 789", "789 makes a run"],
        ["789 heads towards goal — GOAL!"]
      ]
    },
    { "kind": "yellow", "player": 456 },
    { "kind": "sub",    "in": 234, "out": 456 }
  ]
}
```

**Pros:**
- Zadržava minute-keyed strukturu — Unity addressing `(min, evtIdx)` radi prirodno
- Eksplicitni `kind` discriminator — bez if-else gledanja šta ima null/ne-null
- `style` se unaprijed parsira, nema regex na type stringu
- `commentary[i]` je group za `segments[i]` — savršena alignment za Unity sync
- Admin eventi (yellow, sub) su light, bez null polja

**Cons:**
- Miješaju se plays i admin eventi u istom array — consumer mora skipati non-play kad procesira plays
- `att1`/`att2`/`gk`/`def1`/`def2` su i dalje generičke slot nazivi (ne semantičke uloge)
- `outcome` field je djelimično redundantan sa `goal` / `shot` poljem (ali je praktičan za brz lookup)

---

## Opcija 3 — Minute-keyed, segregated (plays vs events)

```json
{
  "45": {
    "plays": [
      {
        "team": 123,
        "style": "fl",
        "outcome": "goal",
        "goal":    { "scorer": 789, "assist": 456 },
        "shot":    { "onTarget": true },
        "penalty": false,
        "segments": [ ... ],
        "commentary": [ [...], [...] ]
      }
    ],
    "cards":    [{ "type": "yellow", "player": 456 }],
    "subs":     [{ "in": 234, "out": 456 }],
    "injuries": [789],
    "mentality":[{ "team": 123, "value": 3 }]
  }
}
```

**Pros:**
- Čista separacija između chances i admin eventi — nema kind check-ova
- `plays[i]` direktno indexira Unity play `i` bez skipanja admin eventi
- Lako fetche sve golove jednog minuta: `min45.plays.filter(p => p.goal)`
- Admin eventi su typed arrays, nema null polja ni union tipova
- Stat derivation (cards, subs, injuries) čita direktno bez filter/map

**Cons:**
- `(min, plays[i])` addressing je blago drugačije nego `(min, evtIdx)` — zahtijeva refactor Unity sync koda
- Slučaj kad u minutu nema plays ali ima card/sub — objekat ostaje sa praznim `plays: []` (minor)
- Nešto više nesting nego Opcija 2

---

## Opcija 4 — Minute-keyed, segregated + semantic segments

Kao Opcija 3, ali `segments` dobijaju semantičke action tipove i role-named playere umjesto clip koda + `att1/att2/gk/def1/def2`.

```json
{
  "45": {
    "plays": [
      {
        "team": 123,
        "style": "fl",
        "outcome": "goal",
        "goal":    { "scorer": 789, "assist": 456, "method": "head" },
        "shot":    { "onTarget": true },
        "penalty": false,
        "segments": [
          { "action": "pass",    "result": "success", "by": 456, "to": 789,  "clip": "pass1"   },
          { "action": "cross",   "result": "success", "by": 789,             "clip": "cross2"  },
          { "action": "header",  "result": "goal",    "by": 789, "gk": 111,  "clip": "header1" }
        ],
        "commentary": [
          ["456 plays the ball to 789", "789 surges forward"],
          ["789 whips in a dangerous cross"],
          ["789 plants a header — GOAL!"]
        ]
      }
    ],
    "cards":    [{ "type": "yellow", "player": 456 }],
    "subs":     [{ "in": 234, "out": 456 }],
    "injuries": [],
    "mentality": []
  }
}
```

**Pros:**
- Sve prednosti Opcije 3, plus:
- `segment.action` je čitljiv tip ("pass", "cross", "header", "tackle", "save"...) — player stats se deriva bez regex na clip kodu
- `segment.by` / `segment.to` / `segment.gk` jasne uloge umjesto generičkih `att1`/`att2`
- `goal.method` ("head" / "foot") eliminira naknadnu video-segment analizu
- Futuristic — lako dodati nova polja, radi sa tipiziranim schemaom

**Cons:**
- Zahtijeva parsiranje clip koda string-ova ("pass1", "defwin3") u semantičke tipove — ili na serveru, ili u normalizaciji
- TM API daje opaque clip kodove — moramo ih mapirati (ali to se lako uradi jednom u normalizaciji)
- Nešto veći payload, naročito za duge minute

---

## Moje lično mišljenje

**Preporuka: Opcija 3**, sa mogućnošću migracije ka Opciji 4 postepeno.

Razlog: Najveći pain point nije parsiranje clip koda — to je rješivo u jednoj lookup tablici. Najveći pain je što su plays i admin eventi (cards, subs, injuries) ubačeni u isti array. Svaki consumer koji procesira plays mora filtrirati, svaki koji čita subs mora skipati plays. Opcija 3 rješava to clean-cut: `plays[i]` je uvijek play, `subs[j]` je uvijek sub.

Unity addressing prelazi sa `(min, evtIdx)` na `(min, plays[i])` — to je jedna linija razlike i zapravo je semantički tačnije jer Unity nikad ne reproducira cards/subs, samo plays.

Opcija 4 je idealna ako imamo kontrolu nad server-side formatom ili ako pišemo normalizaciju koja mapira clip kodove. Preporučujem je kao **drugi korak** — Opcija 3 danas, `action` type u segmentima sutra, jer je Opcija 3 → Opcija 4 migracija aditivna (samo dodaješ `action` field na segment, ne mijenjaš strukturu).

Opcija 2 je OK kompromis ali `plays[i]` indexing je čistiji od `evts[i where kind==='play']` za Unity.

Opcija 1 je idealna za pure event stream (npr. API za treće strane), ali za naš use case (live replay po minutama + Unity sync) minute bucketing je zapravo feature, ne bug.

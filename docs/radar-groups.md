# Radar Groups Analysis — TM Player Compare

## Skill Inventory & Roles (Outfield, 14 skills)

| Skill | Key | Primary role | Position relevance |
|---|---|---|---|
| Strength | `strength` | Winning physical duels, aerial power, shielding ball | All, especially CB/F |
| Stamina | `stamina` | Endurance across 90 min | All, especially MF/Wing |
| Pace | `pace` | Sprint speed, acceleration | Wings, FB, F, CB recovery |
| Marking | `marking` | 1v1 defending, tracking runners | CB, DM, FB |
| Tackling | `tackling` | Ball winning, sliding/standing tackles | CB, DM, FB, MF |
| Workrate | `workrate` | Pressing intensity, off-ball movement | MF, Wing, F (pressing) |
| Positioning | `positioning` | Tactical reading, getting in right place | All, especially MF/DM |
| Passing | `passing` | All ball distribution — short, long, through balls | MF, F, CB |
| Crossing | `crossing` | Delivery from wide, corners, indirect free kicks | Wing, FB |
| Technique | `technique` | Dribbling, ball control, passing quality, finishing quality | MF, Wing, F |
| Heading | `heading` | Aerial duels in attack and defence | CB, F, Wing |
| Finishing | `finishing` | Shot accuracy, goal conversion | F, OM |
| Long Shots | `longshots` | Shots from distance, direct free kicks | MF, OM, F |
| Set Pieces | `set_pieces` | Dead-ball delivery quality (corners, FKs, penalties) | Specialists |

---

## Grouping Rationale

### Why the current 6 groups aren't ideal

| Current group | Problem |
|---|---|
| Work (workrate + positioning) | Name is vague; "Work" says nothing about what dimension it measures |
| Technical (passing + crossing + technique) | Too broad — crossing is wide delivery, passing is playmaking, these are different profiles |
| Attacking (finishing + longshots + set_pieces) | Mixes goal-scoring threat with dead-ball delivery; set_pieces has different profile role |
| Aerial (heading alone) | Fine as singleton but doesn't stand out as a category |

### Natural skill clusters from match engine logic

1. **Physical base** — strength + stamina: raw physical substance, doesn't involve speed
2. **Speed** — pace: entirely separate axis; pace is the single most profile-defining physical attribute
3. **Defending** — marking + tackling: both concern winning the ball and containing attackers
4. **Pressing & Movement** — workrate + positioning: how much a player works without the ball; pressing game and tactical awareness
5. **Ball Playing** — passing + technique: distributing the ball, close control; the playmaking dimension
6. **Delivery** — crossing + set_pieces: delivering dangerous balls, both from open play (crosses) and dead balls
7. **Aerial** — heading: stands alone; it's the most position-differentiating skill (high for CB/F, low for MF/Wing)
8. **Shooting** — finishing + longshots: direct goal threat; separate from delivery; set_pieces removed here since it overlaps with delivery more than shooting

---

## Final Decision — 8 Outfield Groups

| # | Label | Keys | Skills count | Axis meaning |
|---|---|---|---|---|
| 1 | Fitness | `stamina`, `strength` | 2 | Physical base — endurance + power |
| 2 | Pace | `pace` | 1 | Speed — the most profile-defining physical trait |
| 3 | Defending | `marking`, `tackling` | 2 | Ball-winning and containment |
| 4 | Pressing | `workrate`, `positioning` | 2 | Off-ball work ethic + tactical reading |
| 5 | Passing | `passing`, `technique` | 2 | Ball distribution + close control / playmaking |
| 6 | Delivery | `crossing`, `set_pieces` | 2 | Dangerous ball delivery — wide + dead ball |
| 7 | Shooting | `finishing`, `longshots` | 2 | Direct goal threat |
| 8 | Aerial | `heading` | 1 | Aerial dominance (attack + defence) |

**Total: 14 skills, 8 groups, no overlaps.**

Clockwise order from top (45° per axis):
`Fitness → Pace → Defending → Pressing → Passing → Delivery → Shooting → Aerial`

### Profile signatures the radar will produce

| Player type | High axes | Low axes |
|---|---|---|
| Striker | Shooting, Aerial, Pace | Defending |
| Central Defender | Defending, Fitness, Aerial | Shooting |
| Winger | Pace, Delivery, Passing | Defending |
| Central Midfielder | Passing, Pressing, balanced | — |
| Defensive Midfielder | Defending, Pressing, Fitness | Shooting, Delivery |
| Offensive Midfielder | Passing, Shooting, Pressing | Defending |
| Full Back | Pace, Defending, Delivery | Shooting |

---

## GK Groups (6 — unchanged, already meaningful)

| # | Label | Keys |
|---|---|---|
| 1 | Physical | `strength`, `stamina`, `pace` |
| 2 | Shot Stop | `handling`, `reflexes` |
| 3 | 1v1 | `oneonones` |
| 4 | Aerial | `arialability`, `jumping` |
| 5 | Command | `communication` |
| 6 | Distrib. | `kicking`, `throwing` |

# Player History Sync — Target Design

Cilj je da za svakog igrača za svaki mesec od prvog do trenutnog izračunamo tačne decimalne vrednosti svakog skila i sačuvamo u bazu. Sync se pokreće sa players stranice i isključivo tu ima sve podatke da bude potpun.

---

**1) ✅ Parsiramo skill changes iz DOM-a pre svega ostalog**

Kada se players stranica učita, iz tabele igrača za svakog igrača čitamo koji skilovi su porasli a koji su pali ove nedelje. 
Endpoint `https://trophymanager.com/players/#/a/true/b/true/` vraća i A i B tim u istoj tabeli, tako da jednim 
parsiranjem dobijamo skill changes za sve sopstvene igrače. 
Čekamo da se redovi stabilizuju (2 uzastopna polla sa istim brojem redova) pre nego što krenemo sa parsiranjem.

---

**2) ✅ Učitavamo igrače tima**

Povlačimo igrače glavnog tima. Ako ima B tim u SESSION, povlačimo i rezerviste. Spajamo ih u jedan niz. 
Za svakog igrača attachujemo prethodno parsirane skill changes.

---

**3) ✅ Određujemo ko treba sync**

Za svakog igrača proveravamo dve stvari: da li postoje meseci koji fale između prvog DB zapisa i trenutnog meseca,
i da li trenutni mesec u bazi ima `fullySynced: true`. Ako ni jedno ni drugo nije ispunjeno — preskaačemo igrača. 
Marker `fullySynced` se postavlja isključivo ovde na players stranici jer samo ovde imamo skill changes.
Sync sa player profile stranice ga ne postavlja, znači ako je tamo bio urađen sync, ovde će se raditi resync
po tačnijem algoritmu.

---

**4) ✅ Gradimo skeleton istorije po mesecima**

Za svakog igrača sa `needSync: true` prolazimo kroz sledeće podkorake:

**4a) Učitavamo grafove i trening (samo sopstveni igrači, paralelno)**
Za sopstvene igrače povlačimo graphs endpoint: daje TI po mesecu i celobrojne veštine po mesecu ako su dostupne.
Skill index iz grafa ignorišemo — ASI ćemo sami izračunati. Trening učitavamo jer je potreban za raspodelu decimala.
Strani igrači nemaju grafove — preskačemo fetch, idemo samo na bazu.

**4b) Određujemo listu meseci (bez rupa)**
Za sopstvene igrače: broj meseci = `graph.TI.length - 1` (TI[0] = live, TI[1..n] = istorija).
Za strane igrače: meseci iz `DBPlayer.records` ključeva, a ako nema baze onda samo trenutni mesec.
Iz prvog i poslednjeg meseca generišemo kompletan niz bez rupa (svaki `age.month` od prvog do trenutnog).

**4c) Popunjavamo skeleton: skills i weeklyChanges po mesecu**
Za svaki mesec kreiramo zapis `{ TI: null, ASI: null, skills, weeklyChanges }`.
Skills prioritet: trenutni mesec → uvek `player.skills` (live, celi brojevi). Stariji meseci → graph integers (ako postoje) → indexed baza → null.
weeklyChanges: trenutni mesec → `player.weeklyChanges`, stariji → `DBPlayer.records[key].weeklyChanges`.
TI i ASI ostaju null — pune se u sledećim koracima.

---

**5) ✅ Punjenje TI i ASI po mesecima**

Na osnovu skeleton-a iz koraka 4 punimo TI i ASI.

---

**7) ✅ Punjenje celobrojnih veština po mesecima**

Skeleton iz koraka 4 već ima skills za mesece koje smo dobili iz grafa ili baze. Ovde popunjavamo rupe estimacijom.

**7a) Određujemo anchor — prvi mesec koji ima skills**
Prolazimo kroz `monthKeys` od najstarijeg ka najnovijem. Prvi mesec čiji `record.skills` niz ima barem jedan non-null element je anchor. Sve što je pre anchora popunjava se unazad od njega. Sve što je posle popunjava se unapred.

**7b) Estimacija meseci pre anchora (unazad)**
Kao gornju granicu (max integer po skilu) koristimo `anchor.skills`. Na osnovu ASI i treninga igrača raspodeljujemo koji integer bi bio koji skil.

**7c) Estimacija internih rupa (između dva poznata meseca)**
Gornja granica je mesec-anchor posle rupe, donja je mesec-anchor pre rupe. Isti princip.

**7d) Estimacija meseci posle poslednjeg poznatog (unapred)**
Gornja granica je `player.skills` (live, celi brojevi). Isti princip.

---

**8) ✅ Računamo decimalne vrednosti veština**

Sada za svaki mesec imamo TI, ASI i celobrojne veštine. Polazna tačka je prvi mesec za koji znamo integer skillove. Od te tačke idemo unazad do prvog meseca (retroaktivno, na osnovu treninga i TI), a zatim od te tačke napred do trenutnog meseca.

Za polaznu tačku: iz ASI i zbira celobrojnih veština dobijamo ostatak koji rasporedimo po trening grupama i efikasnosti svakog skila.

Za svaki sledeći mesec:
- Ako imamo weekly changes (znamo koji skilovi su `part_up`/`one_up`): ukupno dodato je TI/10,
 raspodeljujemo samo na skillove koji su porasli proporcionalno trening grupama. 
 Decimalni deo tih skila = decimalni deo iz prethodnog meseca + dobitak. 
 Ako zbir prelazi .99 za dati integer, višak raspodeljujemo na ostale. 
 Skillovi koji nisu porasli dobijaju probabilistički decimalni deo.
- Ako nemamo weekly changes: ceo ostatak raspodeljujemo probabilistički po trening grupama.
- Svaka decimala je ograničena na 0.99. Overflow se preraspodeljuje.

---

**9) ✅ Rutina po mesecima**

Trenutni mesec ima rutinu direktno sa igrača. 
Prethodni meseci koji nemaju rutinu dobijaju je linearnom interpolacijom između poznatih tačaka. 
Ako prvi mesec nema rutinu, polazna vrednost je 0.

---

**10) R5 i REC ocene po mesecu**

Za svaki mesec računamo R5 i REC na osnovu decimalnih veština, ASI i rutine za sve preferirane pozicije igrača
i u record stavljamo maksimalan r5 i rec na osnovu preferirianih pozicija. 
U zapis ide maksimum.

---

**11) Čuvamo u bazu**

Sve mesece upisujemo u jednom zapisu. 
Za trenutni mesec upisujemo i `weeklyChanges` (da sledeći sync bez DOM-a može da ih pročita iz baze) i `fullySynced: true`. 
Vraćamo niz igrača i renderujemo tabelu.


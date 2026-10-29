# Correzioni alle schede: prima / dopo (29 ottobre 2026)

Per Davide. Nessun file dei dati e' stato toccato: qui ci sono solo le proposte. Ogni voce e' numerata, cosi' puoi
rispondere "ok 1, 3, 5". I testi inglesi sono citati come sono nei file (con le a capo del YAML ridotte a spazi) e come
diventerebbero. `file:riga` e' la riga dove inizia il campo.

Che cosa ho usato: i tre rapporti dei revisori (`text-`, `site-`, `data-2026-10-29.md`), `BACKLOG.md`, `ONTOLOGY.md`,
`JOURNAL.md` e le schede stesse. Chiamate web: 6 su 6 (Banca di Russia: riuscita; AP via AJC: riuscita; WSB-TV: bloccata
451; White & Case: 403; due prove all'indirizzo dell'Uruguay: nessuna risposta). Tutto il resto viene dai file.

Dopo il tuo ok, per ogni voce approvata: modifica ai file, `reciprocate.py` se serve, `build.py`, e il testo delle schede
nuovo va nella traduzione del giorno (regola delle versioni italiane). Le voci che toccano solo note di stance o righe
restano in inglese, come hai deciso il 23/10.

## Indice

| Voci | Argomento | Da dove viene |
|---|---|---|
| 1-4 | Quattro difetti nelle schede USA, RUS, CHN | rapporto testi 23-26 |
| 5-12 | "since null" e note di lavoro visibili nelle tabelle (sei famiglie) | rapporto sito BUG 6 e COSMETIC 27 |
| 13-24 | Date, schede incomplete, asimmetrie, righe doppie, fonti, unita', parent | rapporto dati I8 I10 I11 I12 I13 C2 C3 C4 |
| 25-27 | Grecia/Libia, forza della missione ad Haiti, morti di Shabwah | BACKLOG, flag dopo W44 |

Le voci che chiedono **un tuo giudizio** (non solo un ok meccanico): 7 (testo e grado si contraddicono: quale vale?), 14
(regola per le stance a confidenza C), 16 (due coppie dubbie), 17 e 18 (cambi di grado), 24 (parent del Sahara Occidentale),
25b (trend GRC->LBY). Le altre sono sostituzioni di testo con una sola risposta possibile.

---

# Parte A. Schede USA, RUS, CHN (rapporto testi 23-26)

## 1. USA · la lettura dice un solo avversario, le stance ne hanno due (data/actors/USA.yaml:774-776 e data/stances/USA.yaml:89)
Quale lato ha ragione: le stance. `data/stances/USA.yaml` ha due `adversary` (Iran, riga 89; Hamas, riga 1106, con 15
`rival`: Cina, Russia, Cuba, Brasile, Houthi, Sudafrica...). Ciascuna ha fonti e una nota che argomenta il grado: Hamas
perche' il piano in 20 punti del 29 set 2025 chiede il disarmo e nessun ruolo nella governance di Gaza, "an aim of
disappearance, not deterrence". La lettura e' stata scritta prima della stance su Hamas; la nota su Iran dice ancora
"The one 'adversary'" ed e' rimasta indietro anch'essa.

Lettura (USA.yaml:774-776)
PRIMA: "Washington's stances read accordingly: one adversary (Iran), two rivals it talks to more than to its allies (China, Russia), and a ring of treaty allies graded reluctant not because they resist the alliance but because Washington does - the first great power in the atlas whose friction with its allies is mostly its own."
DOPO:  "Washington's stances read accordingly: two adversaries (Iran and Hamas), fifteen rivals of which the two it talks to more than to its allies are China and Russia, and a ring of treaty allies graded reluctant not because they resist the alliance but because Washington does - the first great power in the atlas whose friction with its allies is mostly its own."

Nota della stance Iran (stances/USA.yaml:89, solo l'attacco)
PRIMA: "The one 'adversary' of the card and the test case for the grade."
DOPO:  "The first of the card's two 'adversaries' and the test case for the grade."

Perche': i numeri della lettura devono coincidere con le stance (2 adversary, 15 rival, 18 reluctant ally, 33 ally,
contati oggi sul file). Nessun grado cambia. Testo di scheda: va nella traduzione del giorno.
Fonte: nessun fatto nuovo (le fonti sono quelle delle due stance).

## 2. USA · "the same quarter": la licenza Patriot e' di luglio, il diesel di ottobre (data/actors/USA.yaml:734-737)
Le due date "Oct 2026" (USA.yaml:275 e stances/USA.yaml:53) sono giuste: le fonti sono ITV News del 9 ott 2026
("A 'gift to Putin': Zelenskyy condemns Trump's deal to obtain diesel from Russia") e Reuters dell'11 ott 2026 (senatore
repubblicano: l'accordo puo' essere illegale). La licenza di produzione dei Patriot all'Ucraina e' di luglio (Ankara;
bne IntelliNews, luglio 2026; la stance USA->UKR dice "Warming since July; the diesel deal with Moscow of 9 Oct shows the
limit"). Lo sbaglio e' solo nel paradosso 2.

PRIMA: "...and by paying for American weapons through PURL, so that by July 2026 Washington was licensing Patriot production to Ukraine and buying Russian diesel in the same quarter. The mediator ends up the arsenal of one side and the customer of the other..."
DOPO:  "...and by paying for American weapons through PURL, so that within four months, from July to October 2026, Washington licensed Patriot production to Ukraine (July) and agreed to buy Russian diesel (announced 9 October). The mediator ends up the arsenal of one side and the customer of the other..."

Perche': luglio e ottobre non sono lo stesso trimestre; il paradosso regge lo stesso.
Fonte: ITV News, "A 'gift to Putin': Zelenskyy condemns Trump's deal to obtain diesel from Russia", 9 ott 2026
(https://www.itv.com/news/2026-10-09/trump-says-us-to-obtain-diesel-from-russia-despite-energy-sanctions), gia' nella
scheda; bne IntelliNews, "Trump offers Ukraine Patriot production licence in major policy about-face", lug 2026, gia' nella scheda.

## 3. RUS · la lettura da' per attuale un tasso che la scheda stessa dice superato (data/actors/RUS.yaml:323-324, 497-498, 583-586)
Le fonti nella scheda sono piu' vecchie dell'affermazione: Trading Economics del 11 set 2026 ("21% peak, 14% held on
11 Sep 2026"). Ho fatto una chiamata alla Banca di Russia: la tabella ufficiale del tasso chiave
(https://www.cbr.ru/eng/hd_base/keyrate/, letta il 29 ott 2026) da' 14,00% per ogni giorno dal 22 al 29 ottobre, quindi
anche il 23 ottobre (data di riunione del consiglio) non ha cambiato nulla. Il 21% e' il picco del 2024-25, non il tasso
di oggi. La pagina non dice da quando il tasso e' 14%: non lo scrivo.

Vincolo 1 (RUS.yaml:323-324)
PRIMA: "...the key rate peaked at 21% and was only at 14% in Sept 2026, oil and gas revenues fell 22% in the first eleven months of 2025..."
DOPO:  "...the key rate peaked at 21% and stood at 14% in Sept 2026 and still on 29 Oct 2026, oil and gas revenues fell 22% in the first eleven months of 2025..."
Fonte nuova da aggiungere a quel vincolo: https://www.cbr.ru/eng/hd_base/keyrate/ , "Key rate of the Bank of Russia (daily values 22-29 Oct 2026: 14.00%)", Bank of Russia, 2026-10-29, tier 1.

Paradosso 3 (RUS.yaml:497-498)
PRIMA: "The advance of 2025 (4,336 sq km, 0.72% of Ukraine) cost a defence budget of 40% of state spending, a 21% key rate, collapsing civilian investment and a Korean expeditionary corps;"
DOPO:  "The advance of 2025 (4,336 sq km, 0.72% of Ukraine) cost a defence budget of 40% of state spending, a key rate that peaked at 21%, collapsing civilian investment and a Korean expeditionary corps;"

Lettura (RUS.yaml:583-586)
PRIMA: "the front moves by villages, the price is a budget 40% military, a 21% key rate and civilian investment in collapse, and the manpower comes from Pyongyang."
DOPO:  "the front moves by villages, the price is a budget 40% military, a key rate that peaked at 21% (14% now) and civilian investment in collapse, and the manpower comes from Pyongyang."

Perche': tre punti della stessa scheda non si contraddicono piu' sul tasso. Fonte: Banca di Russia, come sopra.

## 4. CHN · due misure diverse chiamate "affiliates rule" (data/actors/CHN.yaml:25, 117, 159)
Sono due cose: la "affiliates rule" e' la norma americana del 29 set 2025 (Commerce, estende la lista nera alle
controllate; la fonte Reuters nella scheda la intitola "the 50% 'affiliates rule'"). La misura cinese del 9 ott 2025
(MOFCOM) e' il regime extraterritoriale sulle terre rare con soglia di contenuto dello 0,1%: non e' una "affiliates rule".
L'obiettivo 2 e il vincolo 3 dicono gia' la cosa giusta (norma americana); sbaglia solo la riga 117, e l'obiettivo 2
non dice di quale delle due parla, per cui il lettore non sa quale Pechino voglia vedere tolta.

Mezzi, economico (CHN.yaml:117)
PRIMA: "...the extraterritorial regime of 9 Oct 2025 (a Chinese 'affiliates rule' with a 0.1% content threshold) that brought Trump to Busan and was then suspended for a year..."
DOPO:  "...the extraterritorial regime of 9 Oct 2025 (China's own counterpart to the American 'affiliates rule', with a 0.1% content threshold) that brought Trump to Busan and was then suspended for a year..."

Obiettivo 2 (CHN.yaml:25)
PRIMA: "...the chip embargo and the 'affiliates rule' are what Beijing wants lifted next."
DOPO:  "...the chip embargo and the American 'affiliates rule' of 29 Sep 2025 are what Beijing wants lifted next."

Perche': i due nomi restano separati in tutta la scheda. Da controllare, non risolto: il titolo della fonte White & Case
citata alla riga ~121 dice "China imposes extraterritorial jurisdiction and a 50% rule in export controls on rare earths",
mentre la scheda scrive soglia 0,1%; non ho potuto aprire la pagina (HTTP 403). Se il titolo e' giusto, la soglia da citare e'
da verificare su quella pagina prima di cambiare altro.
Fonte: Reuters, "US expands export blacklist to include subsidiaries", 29 set 2025, gia' nella scheda (CHN.yaml:164).

---

# Parte B. "since null" e note di lavoro visibili nelle tabelle

## 5. LCA · "since null" nel testo (data/relations/LCA.yaml:7)
Compare nella scheda di Saint Lucia e in quella di Taiwan (righe verso Taiwan). La riga del dataset ha `since: null`
(_recognition.yaml:9330): non c'e' una data di inizio.
PRIMA: "...The dataset recognition row (since null) is kept; this row dates the current tie."
DOPO:  "...The dataset recognition row carries no start date and is kept; this row dates the current tie."
Perche': una parola del codice ("null") in una frase per il lettore. Fonte: nessun fatto nuovo.

## 6. Note di stance con il segno della revisione davanti: "Review 2026-10-12: regraded ..." (12 note)
Come li ho trovati: `scan_notes.py` e `hist.py` nello scratchpad leggono tutte le 4.413 note di stance e tutti i
riassunti delle 10.301 righe e cercano le formule di lavoro. In `ONTOLOGY.md` **non esiste un campo `review:`** (ho
cercato la parola: compare solo in due frasi di metodo): quindi propongo di togliere il segno e tenere la ragione del grado,
che e' la parte utile; la storia della modifica resta in git e nel JOURNAL. In alternativa servirebbe un campo nuovo, con
voce in ONTOLOGY e in JOURNAL e una riga in `build.py`: costa di piu' e non porta niente al lettore. Dimmi se lo vuoi.

Le tabelle delle Classifiche (Faults, Flanks, Currents) mostrano la prima frase della nota, tagliata a 220 caratteri:
per questo il segno si vede subito. Le altre 9 note che portano lo stesso segno, ma il cui testo si contraddice, sono
nella voce 7. Qui sotto: 12 note dove basta togliere il segno.

| File:riga | PRIMA (solo il tratto che cambia) | DOPO |
|---|---|---|
| stances/AFG.yaml:10 (AFG->PAK) | "...the reason the trend is cooling and the confidence C; if Pakistan states a regime-change aim or Kabul seeks Pakistani territory, regrade. Bond - grievance: ... Asymmetric pairing with PAK's own side is expected to differ (Islamabad is likely to grade Kabul adversary)." | "...the reason the trend is cooling and the confidence C; the grade would change if Pakistan stated a regime-change aim or Kabul sought Pakistani territory. Bond - grievance: ... Pakistan's card grades Kabul rival too (cooling)." (verificato: PAK->AFG e' rival, cooling, B) |
| stances/ARG.yaml:65 (ARG->BRA) | "Regraded 2026-10-16 from partner to reluctant_partner, because the note that justified 'partner' ('no source uses the reluctant reading') is contradicted: the BRA card now grades Argentina reluctant_partner on MercoPress..." | "Reluctant partner: the BRA card grades Argentina reluctant_partner on MercoPress..." |
| stances/ARG.yaml:120 (ARG->ESP) | "Argentina's side, written 2026-10-16 from the same evidence as the ESP card (review of 2026-10-12: regraded there from rival to reluctant_partner because the quarrel is personal and ideological, with no opposed structural aim: investment, migration, Mercosur and the Ibero-American frame pull together). The spat: ... Sharpened: the crisis was closed in October 2024..." | "Argentina's side, from the same evidence as the ESP card: the quarrel is personal and ideological, with no opposed structural aim (investment, migration, Mercosur and the Ibero-American frame pull together), hence reluctant_partner and not rival. The spat: ... The crisis was closed in October 2024..." |
| stances/BIH.yaml:10 (BIH->sub-rs) | "Review 2026-10-12: regraded rival - Republika Srpska is an entity of the state (own territory in law); the actor graded here is its leadership, which competes with the state." | "Rival, not claimed territory: Republika Srpska is an entity of the state (own territory in law); the actor graded here is its leadership, which competes with the state." |
| stances/ERI.yaml:10 (ERI->ETH) | "Adversary (review regrade from rival, 2026-10-16): since 1 Oct 2026 each state reads the other as a mortal threat." | "Adversary: since 1 Oct 2026 each state reads the other as a mortal threat." |
| stances/ESP.yaml:297 (ESP->ARG) | "Review 2026-10-12: regraded from rival to reluctant_partner; the Milei-Sanchez spat (ambassador withdrawn 2024) is personal and ideological..." | "Reluctant partner, not rival: the Milei-Sanchez spat (ambassador withdrawn 2024) is personal and ideological..." |
| stances/ETH.yaml:65 (ETH->ERI) | "...the Eritrean card (review regrade of 2026-10-16) reads Ethiopia as adversary too, at confidence C." | "...the Eritrean card reads Ethiopia as adversary too, at confidence C." |
| stances/GEO.yaml:286 (GEO->UKR) | "Review 2026-10-12: regraded reluctant_partner - estrangement, not competition: Tbilisi cooperates..." | "Reluctant partner - estrangement, not competition: Tbilisi cooperates..." |
| stances/LTU.yaml:10 (LTU->RUS) | "Review 2026-10-12: regraded from adversary to rival for consistency with Estonia, Latvia-to-be and Poland; 'adversary' is reserved for actors seeking each other's destruction (Iran-Israel), while..." | "Rival, not adversary, for consistency with Estonia, Latvia and Poland: 'adversary' is reserved for actors seeking each other's destruction (Iran-Israel), while..." |
| stances/LUX.yaml:43 (LUX->USA) | "Review 2026-10-12: regraded from partner to reluctant_ally - Luxembourg and the United States are NATO treaty co-members, so friction (the Feb 2026 'rupture' trip, tax and Greenland) makes a reluctant ally, never a partner, by the ontology rule." | "Reluctant ally - Luxembourg and the United States are NATO treaty co-members, so friction (the Feb 2026 'rupture' trip, tax and Greenland) makes a reluctant ally, never a partner." |
| stances/LVA.yaml:10 (LVA->RUS) | "Review 2026-10-12: regraded from adversary to rival for consistency with Estonia and Lithuania; 'adversary' is reserved..." | "Rival, not adversary, for consistency with Estonia and Lithuania; 'adversary' is reserved..." |
| stances/MCO.yaml:69 (MCO->RUS) | "Review 2026-10-12: regraded from partner to neutral (cooling): Monaco applies the EU sanctions since March 2022..." | "Neutral, cooling: Monaco applies the EU sanctions since March 2022..." |

Perche': il lettore vede il motivo del grado, non la cronologia del nostro lavoro. Fonte: nessun fatto nuovo, tranne la
riga AFG->PAK, dove ho letto il grado di PAK->AFG nel file (`stances/PAK.yaml`, rival, cooling, B).

## 7. Note che argomentano ancora il vecchio grado (9 note, trovate leggendo la voce 6)
Nelle note con il segno "regraded" il grado e' stato cambiato ma una parte del testo e' rimasta com'era. Il lettore trova
"Partner, not ally" sotto una scheda graduata `ally`. Qui togliere il segno non basta: propongo anche la frase che segue il
grado vero. In ALB, MKD e MNE "co-members of NATO/EU" e' inesatto (Albania, Macedonia del Nord e Montenegro sono membri
NATO, candidati UE): scrivo "NATO".

| File:riga | PRIMA | DOPO |
|---|---|---|
| stances/ALB.yaml:38 (ALB->GRC, reluctant_ally) | "Review 2026-10-12: regraded reluctant_ally - co-members of NATO/EU with visible friction are allies by necessity, not rivals (ONTOLOGY scale). Both are NATO members..." e piu' avanti "'Rival' is the friction grade, not hostility: trade and tourism are dense, the 1996 friendship treaty stands, and the Delphi Declaration 2026 supports accelerating accession. No source says 'rival': our reading (confidence C)." | "Co-members of NATO with visible friction are allies by necessity, not rivals. Both are NATO members..." e "Reluctant ally, not rival: the friction is real but not hostile: trade and tourism are dense, the 1996 friendship treaty stands, and the Delphi Declaration 2026 supports accelerating accession. No source uses either word: our reading (confidence C)." |
| stances/FRA.yaml:327 (FRA->ISR, reluctant_partner) | "Review 2026-10-12: regraded from rival to reluctant_partner (bond grievance) for consistency with the other EU cards (Denmark, Estonia, Spain-to-come grade Israel partner/cooling): the quarrel over Palestine's recognition is open, but..." e in fondo "Rival, not adversary: diplomatic relations and security contacts continue." | "Reluctant partner (bond grievance), for consistency with the other EU cards (Denmark and Estonia grade Israel partner/cooling): the quarrel over Palestine's recognition is open, but..." e "Reluctant partner, not rival: diplomatic relations and security contacts continue." (nota: `stances/ESP.yaml` grada Israele **rival**, cooling, C: "Spain-to-come ... partner/cooling" e' sbagliato, lo tolgo) |
| stances/ITA.yaml:176 (ITA->UKR, ally) | la stessa frase "Review 2026-10-12: regraded from partner to ally for consistency with the other EU cards, where a bilateral security agreement plus sustained military aid is read as a stable de facto alignment (Denmark, Estonia, Latvia, France); Italy's refusal of troops is the same as Germany's and does not change the structure." scritta **tre volte di fila**, poi "Partner, not ally: a bilateral security cooperation agreement (Kyiv, 24 Feb 2024) extending the G7 Vilnius declaration, the host of the Ukraine Recovery Conference in Rome (10-11 July 2025, over EUR 10bn pledged), military aid by decree through the Copasir committee, and support for sanctions and for the EU loan. But no troops:..." | una volta sola: "Read as ally, for consistency with the other EU cards, where a bilateral security agreement plus sustained military aid is read as a stable de facto alignment (Denmark, Estonia, Latvia, France); Italy's refusal of troops is the same as Germany's and does not change the structure. The alignment rests on a bilateral security cooperation agreement (Kyiv, 24 Feb 2024) extending the G7 Vilnius declaration, on hosting the Ukraine Recovery Conference in Rome (10-11 July 2025, over EUR 10bn pledged), on military aid by decree through the Copasir committee, and on support for sanctions and for the EU loan. But no troops:..." |
| stances/MKD.yaml:10 (MKD->BGR, reluctant_ally) | "Review 2026-10-12: regraded reluctant_ally - co-members of NATO/EU with visible friction are allies by necessity, not rivals (ONTOLOGY scale)." e "The grade is rival, not ally, although both are NATO members (the dataset would derive 'ally'): Sofia's claim that Macedonian language and history are Bulgarian is a contest over identity, and the bilateral friendship treaty of 2017 and Corridor 8 are working in parallel." | "Co-members of NATO with visible friction are allies by necessity, not rivals." e "The grade is reluctant ally, not plain ally, although both are NATO members (the dataset would derive 'ally'): Sofia's claim that Macedonian language and history are Bulgarian is a contest over identity; and not rival, because the bilateral friendship treaty of 2017 and Corridor 8 are working in parallel." |
| stances/MKD.yaml:24 (MKD->GRC, reluctant_ally) | "Review 2026-10-12: regraded reluctant_ally - co-members of NATO/EU with visible friction are allies by necessity, not rivals (ONTOLOGY scale)." e "Partner rather than ally despite common NATO membership (the dataset would derive 'ally'): the name is a standing grievance..." | "Co-members of NATO with visible friction are allies by necessity, not rivals." e "Reluctant ally rather than plain ally despite common NATO membership (the dataset would derive 'ally'): the name is a standing grievance..." |
| stances/MNE.yaml:50 (MNE->org-eu, partner) | "Review 2026-10-12: regraded partner - the EU gives candidates no guarantee; ally is reserved for members (Art. 42(7)). Not a treaty ally in the Article 42(7) sense (Montenegro is a candidate), but a stable de facto alignment that the ontology's 'ally' grade covers: 'full and resolute' CFSP alignment praised by the European Parliament..." | "Partner, not ally: the EU gives candidates no guarantee, and 'ally' is reserved for members (Art. 42(7)). Montenegro is a candidate, but its alignment is stable and close: 'full and resolute' CFSP alignment praised by the European Parliament..." |
| stances/MNE.yaml:137 (MNE->HRV, reluctant_ally) | "Review 2026-10-12: regraded reluctant_ally - co-members of NATO/EU with visible friction are allies by necessity, not rivals (ONTOLOGY scale)." e "...Zagreb is the principal obstacle. 'Rival', not 'adversary': Croatia wants the issues settled, not Montenegro defeated." | "Co-members of NATO with visible friction are allies by necessity, not rivals." e "...Zagreb is the principal obstacle. Reluctant ally, not rival or adversary: Croatia wants the issues settled, not Montenegro defeated." |
| stances/NLD.yaml:161 (NLD->UKR, ally) | "Review 2026-10-12: regraded from partner to ally for consistency with the other EU cards: a ten-year bilateral security agreement, F-16s, Patriots and about EUR 20bn of aid are read as a stable de facto alignment (Denmark, Estonia, Italy, Spain), not a partnership. Not an ally: no defence guarantee, but a ten-year bilateral security agreement (2024), F-16s delivered..." | "Ally, for consistency with the other EU cards: a ten-year bilateral security agreement, F-16s, Patriots and about EUR 20bn of aid are read as a stable de facto alignment (Denmark, Estonia, Italy, Spain), not a partnership. No defence guarantee, but a ten-year bilateral security agreement (2024), F-16s delivered..." |
| stances/PRT.yaml:323 (PRT->UKR, ally) | "Review 2026-10-12: regraded from partner to ally for consistency with the other EU cards (a bilateral security agreement plus sustained aid is read as a stable de facto alignment). Bilateral security agreement signed in Lisbon on 28 May 2024... A support agreement, not a defence guarantee, so partner and not ally." | "Ally, for consistency with the other EU cards (a bilateral security agreement plus sustained aid is read as a stable de facto alignment). Bilateral security agreement signed in Lisbon on 28 May 2024... A support agreement, not a defence guarantee: the grade reads the alignment, not a treaty obligation." |

Perche': nessun grado cambia (sono i gradi gia' scritti nel campo `grade`); cambia solo il testo, che ora dice lo stesso del
campo. Domanda per te, non per me: in MKD->GRC e MKD->BGR il testo originale argomentava piu' a favore di "partner"/"rival"
che di "reluctant ally"; se il grado che vuoi e' quello vecchio, si cambia il campo `grade`, non il testo.
Fonte: nessun fatto nuovo (le fonti sono quelle gia' nelle note).

## 8. Note di stance che raccontano la modifica del trend ("Trend raised/changed ...", "so the grade holds") (6 note)
La nota e' l'unica cosa che il lettore legge sul perche' di un grado; "Trend raised from cooling" racconta la storia del
file, non la situazione. In `FIN.yaml:64` ("the reason the grade holds") la frase e' un ragionamento e la lascio.

| File:riga | PRIMA | DOPO |
|---|---|---|
| stances/ARG.yaml:39 (ARG->GBR, rival cooling) | "Trend changed from stable to cooling on 2026-10-16, which contradicts this card's earlier reading (it said Milei is friendly in tone and the claim unchanged, and now agrees with the GBR card): on 3 Sep 2026 Milei announced sanctions on the Sea Lion operators..." | "Cooling since September 2026: on 3 Sep 2026 Milei announced sanctions on the Sea Lion operators..." |
| stances/ARG.yaml:148 (ARG->CHL, partner stable) | "Trend changed from warming to stable because a new irritant has opened: Decree 457/2021..." | "Stable rather than warming, because a new irritant has opened: Decree 457/2021..." |
| stances/COL.yaml:62 (COL->VEN, reluctant_partner cooling) | "Update of 16 Oct 2026 (sharpened, the earlier note said no post-7-Aug source existed): the VEN card of the atlas holds the new government's line, which this card now mirrors - ... Trend changed from stable to cooling for that reason: the direct channel Petro opened (the Caracas meeting of 24 Apr 2026) is closed in principle. Grade kept: the border still obliges dealings..." | "Since 7 Aug 2026: the VEN card of the atlas holds the new government's line, which this card now mirrors - ... Cooling for that reason: the direct channel Petro opened (the Caracas meeting of 24 Apr 2026) is closed in principle. The grade stays: the border still obliges dealings..." |
| stances/SRB.yaml:73 (SRB->org-eu, reluctant_partner warming) | "Trend raised from cooling after the 25 Oct 2026 election, as von der Leyen and Costa welcomed the Student List win... The grade is unchanged because no government has yet stated a line on alignment or Cluster 3." | "Warming since the 25 Oct 2026 election, as von der Leyen and Costa welcomed the Student List win... The grade stays reluctant_partner because no government has yet stated a line on alignment or Cluster 3." |
| stances/SRB.yaml:10 (SRB->XKX, claimed_territory stable) | "...CFR (27 Oct) calls it unclear whether the incoming government will pursue normalisation, and no source yet gives the list's line on Kosovo, so the grade holds." | "...CFR (27 Oct) calls it unclear whether the incoming government will pursue normalisation, and no source yet gives the list's line on Kosovo." |
| stances/ISR.yaml:444 (ISR->QAT, rival cooling) | "...and Likud has claimed the election was stolen by Arab parties, so the trend turns to cooling and the grade holds." | "...and Likud has claimed the election was stolen by Arab parties; the trend is cooling and the grade rival." |

Perche': come la voce 6. Nota su COL: "7 Aug" e' la data che la nota stessa usa; se non e' l'insediamento del nuovo
governo, correggila tu. Fonte: nessun fatto nuovo.

## 9. Riferimenti a `ONTOLOGY` nei testi pubblici (11 occorrenze)
`ONTOLOGY` e' il nome di un file del progetto. Altre 4 occorrenze (ALB, MKD x2, MNE->HRV) sono nella voce 7; qui le altre 7.
Lascio stare "the ontology" in minuscolo (66 note: "the ontology's adversary test", "partner under the ontology"): e' una
parola del metodo, spiegata nella pagina About; se la vuoi togliere e' una sostituzione meccanica, dimmelo.

| File:riga | PRIMA | DOPO |
|---|---|---|
| stances/ARE.yaml:10 | "Graded ally on the ONTOLOGY rule (stable de facto alignment); the missing treaty is written into the card as a constraint..." | "Graded ally on the atlas's rule for a stable de facto alignment; the missing treaty is written into the card as a constraint..." |
| stances/AUS.yaml:149 (AUS->CHN) | "Our reading of the structure, not a label any source uses (the brief for this card suggested 'partner'; the structural rule of ONTOLOGY.md points the other way and the reviewer should decide)." | "Our reading of the structure, not a label any source uses." |
| stances/BGR.yaml:77 (BGR->MKD) | "Review rule: co-members of NATO with visible friction are reluctant allies, not rivals (ONTOLOGY scale; the dataset would derive 'ally' from NATO alone), and Skopje grades Sofia the same." | "Co-members of NATO with visible friction are reluctant allies, not rivals (the dataset would derive 'ally' from NATO alone), and Skopje grades Sofia the same." |
| stances/CHN.yaml:10 (CHN->USA) | "Rival, the atlas's reference case for the grade (ONTOLOGY: 'the US toward China'), read here from Beijing:..." | "Rival, the atlas's reference case for the grade (the US toward China), read here from Beijing:..." |
| stances/USA.yaml:10 (USA->CHN) | "The atlas's reference case for 'rival' (ONTOLOGY: 'the US toward China'), read from Washington:..." | "The atlas's reference case for 'rival' (the US toward China), read from Washington:..." |
| stances/CRI.yaml:30 (CRI->NIC) | "Our reading in full: the ONTOLOGY 'rival' grade means friction without a will to destroy, which this summary fits but does not prove." | "Our reading in full: the 'rival' grade means friction without a will to destroy, which this summary fits but does not prove." |
| relations/DZA.yaml:244 (nota, riga energia) | "Overlapping five-year windows; the most recent official figure is used (ONTOLOGY lesson 3). A reported Su-57 order is unverified." | "Overlapping five-year windows; the most recent official figure is used. A reported Su-57 order is unverified." |

Perche': AUS->CHN e' la piu' grave: dice al lettore che "il revisore deve decidere". Fonte: nessun fatto nuovo.

## 10. Altre formule di lavoro nelle note (19 note di stance, 6 righe)
Frasi che parlano di "the build", "BACKLOG", "JOURNAL", di "Davide", di bozze: non descrivono il mondo. Per quattro di esse ho
verificato che sono ormai anche **false**: la scheda a cui rimandano oggi contiene la stance che la nota dice mancare
(RUS->CAF partner, SLV->HTI partner, FRA->SEN partner, CHN->MEX partner). Le altre due (PRK, RUS: "Ukraine's card holds no row")
sono ancora vere (UKR ha una stance verso PRK, rival, ma nessuna riga di relazione) ma sono promemoria interni. Le tolgo tutte.
Lascio "dataset floor" e "hand-written" (una dozzina di note): descrivono il metodo e la pagina About le spiega.
In generale "flagged" nelle righe di rotta (Israeli-flagged, Malta-flagged) e' la bandiera di una nave: non si tocca.

| File:riga | PRIMA | DOPO |
|---|---|---|
| stances/BEN.yaml:45 (BEN->RWA) | "...our Africanews source puts the signing in April 2023, so the date is flagged for Davide, not edited here." | "...our Africanews source puts the signing in April 2023, so the date is uncertain." |
| stances/BRA.yaml:309 (BRA->URY) | "Rewritten from Brazil's side on 2026-10-16 (the first draft was a provisional reciprocal of Uruguay's stance, flagged for this rewrite)." | (frase tolta) |
| stances/CAF.yaml:10 (CAF->RUS) | "Mirror: the RUS card holds no stance toward CAF, so the build's provisional reciprocal is only a placeholder; Moscow's own grade should be written from..." (la frase continua con un compito) | (frase tolta; RUS->CAF esiste: partner). Il resto della nota resta: "Gap: the gold and timber concessions are not sourced in this pass." |
| stances/CAN.yaml:227 e :251 (CAN->LVA, CAN->PHL) | "Canada's own side, rewritten from the provisional reciprocal: ..." | stesso testo senza il tratto prima dei due punti |
| stances/HTI.yaml:159 (HTI->SLV) | "El Salvador has no stance toward Haiti in its own file, so the build adds a provisional reciprocal." | (frase tolta; SLV->HTI esiste: partner) |
| stances/LBY.yaml:110 (LBY->RUS) | "...flagged for review, since the structure (Russia equips the army that attacked Tripoli in 2019-20) could justify rival." | "...although the structure (Russia equips the army that attacked Tripoli in 2019-20) could justify rival." |
| stances/MEX.yaml:106 (MEX->CHN) | "Confidence stays B on the posture; the CHN card holds the reverse stance as a provisional reciprocal." | "Confidence stays B on the posture." |
| stances/MHL.yaml:10 (MHL->USA) | "...the pair reads as a Byzantine alliance, which the build will show as a fault." | "...the pair reads as a Byzantine alliance, which the Faults page shows." |
| stances/NER.yaml:60 (NER->DZA) | "...the Algeria card holds the mirror as neutral and the build will show the asymmetry." | "...the Algeria card reads Niger as neutral." |
| stances/PRK.yaml:162 (PRK->UKR) | "Ukraine's card holds no row toward PRK (BACKLOG on its side)." | (frase tolta) |
| stances/RUS.yaml:167 (RUS->PRK) | "This is the alliance Ukraine's card is still missing (BACKLOG)." | (frase tolta) |
| stances/RUS.yaml:970 (RUS->SAU) | "...which the build flags as 'partner of an adversary's ally': the answer is that the framework is counter-drone and defensive..." | "...which counts as 'partner of an adversary's ally': the answer is that the framework is counter-drone and defensive..." |
| stances/RUS.yaml:2585 (RUS->LBY) | "...so the structure could justify rival; flagged for review." | "...so the structure could justify rival." |
| stances/SEN.yaml:10 (SEN->FRA) | "The FRA card has no stance toward SEN, so France's side is a provisional reciprocal." | (frase tolta; FRA->SEN esiste: partner) |
| stances/SOM.yaml:482 (SOM->sub-puntland) | "The Puntland-side reading was not found, so the reciprocal stance generated by the build is provisional." | "The Puntland-side reading was not found." |
| stances/ZAF.yaml:62 (ZAF->ISR) | "No source retrieved calls the relation 'rival'; the gap is to be logged in JOURNAL." | "No source retrieved calls the relation 'rival'." |
| stances/nsa-hamas.yaml:10 (Hamas->ISR) | "Symmetric with Israel's own reading, as the build expects." | "Symmetric with Israel's own reading." |
| stances/sub-rs.yaml:87 (sub-rs->HRV) | "Croatia's own card grades RS 'neutral' (placeholder); the asymmetry is deliberate and flagged." | "Croatia's own card grades RS 'neutral'; the asymmetry is deliberate." |
| relations/MEX.yaml:90 (MEX->CHN, sanction) | "...Recorded as 'sanction' because the vocabulary has no trade-measure type; a question for Davide (see JOURNAL)." | "...Recorded as 'sanction' because the vocabulary has no trade-measure type." |
| relations/MHL.yaml:32 (MHL->USA, investment) | "Recorded as investment because the vocabulary has no aid type: flagged for a decision." | "Recorded as investment because the vocabulary has no aid type." |
| relations/TUV.yaml:84 (TUV->TWN, investment) | "The vocabulary has no aid type, so investment is used here as the nearest fit; flagged for review." | "The vocabulary has no aid type, so investment is used here as the nearest fit." |
| relations/RUS.yaml:299 (RUS->PRK, treaty) | "...BACKLOG: Ukraine's card holds no row toward PRK; the alliance is written here from Moscow's side." | (frase tolta) |
| relations/FSM.yaml:43 e :56 (FSM->CHN, ...) | "Pre-2022 and flagged stale;..." | "Pre-2022;..." (la pagina segnala gia' da sola le righe vecchie) |

Perche': come la voce 6; quattro delle frasi tolte erano diventate false. Il tratto "the vocabulary has no aid type"
(MHL, TUV, MEX) resta come spiegazione del tipo scelto: e' un fatto sul dato, non un compito. Il BACKLOG ha gia' la voce
"An `aid` dependency type" (13 ott). Fonte: nessun fatto nuovo.

## 11. Segni di rielaborazione: "Sharpened 2026-10-16:", "Rewritten ... (replaces the provisional reciprocal ...)", "Delta 29 October 2026:" (circa 40 occorrenze)
Tre famiglie, tutte meccaniche. Elenco i luoghi; la regola e' la stessa per tutti.

a) **"Sharpened 2026-10-16[ from X]:"** o "Corrected 2026-10-16:" in testa a un'informazione che resta valida: si toglie il segno e la frase
   comincia dal fatto. 22 luoghi: stances/ARG.yaml:10, 95, 108, 120; BRA.yaml:10 (anche "the trend is moved from warming to
   stable", frase di cronologia: via; e "The sources read after the first draft contradict a thaw" diventa "The sources read contradict a thaw"), 97, 153 (anche "the first draft said Brazil's recognition ... was not used": via), 250
   (stessa frase sul trend: via); MEX.yaml:10, 79, 106, 180, 212, 243; ZAF.yaml:10, 135; relations/ARG.yaml:46, 101, 445;
   MEX.yaml:60, 76, 90. Esempio.
   PRIMA: "Sharpened 2026-10-16: the 25% tariffs of 4 Mar 2025 named above ended on 20 Feb 2026 when the Supreme Court struck down the IEEPA tariffs (6-3);..." (MEX.yaml:10)
   DOPO:  "The 25% tariffs of 4 Mar 2025 named above ended on 20 Feb 2026 when the Supreme Court struck down the IEEPA tariffs (6-3);..."
b) **"Rewritten ... (replaces the provisional reciprocal ...)"** e "Argentina's side, written 2026-10-16": la frase si toglie. 10 luoghi qui (e 4 nelle voci 6 e 10):
   stances/ARG.yaml:133, 148, 162 (la 120 e' nella voce 6); CAN.yaml:227, 251 (voce 10); MEX.yaml:280, 294; NGA.yaml:226, 250, 269;
   PER.yaml:108; ZAF.yaml:243; BRA.yaml:309 (voce 10).
   PRIMA: "Rewritten from Nigeria's side on 2026-10-16 (replaces the provisional reciprocal of Ghana's stance)." (NGA.yaml:226)
   DOPO:  (frase tolta; il resto della nota comincia dal fatto)
c) **"Delta 29 October 2026:"** (stances/nsa-houthis.yaml:10 e :53). "Delta" e' il nome interno del passaggio.
   PRIMA: "Delta 29 October 2026: the reopened war (19-28 October) keeps the trend cooling."
   DOPO:  "Update, 29 October 2026: the reopened war (19-28 October) keeps the trend cooling."
Lascio "Update of 16 Oct 2026" e "Update 2026-10-29: the election outcome is now known" (ARG.yaml:65): sono datazioni di fatti,
non cronologia del lavoro. Lascio anche "earlier draft" in AUS.yaml:401, relations/AUS.yaml:368 e "after first drafting" in
relations/AND.yaml:94: parlano di bozze di trattati, non delle nostre.
Perche': come la voce 6. Fonte: nessun fatto nuovo.

## 12. "Mirror of the X card ..." in testa a note e righe scritte a mano (404 occorrenze)
Sono 228 note di stance e 176 righe di relazione dove una frase scritta a mano dice "Mirror of the PRT card's stance
toward AGO (partner, kin, same sources, not re-researched)." o "Mirrors Ukraine's own card.". In 172 casi la frase e' la
**prima** della nota, cioe' quella che le tabelle mostrano: il lettore vede solo "Mirror of ...". Tre tipi:
- frase breve da sola (338): si toglie la frase;
- "Mirror of the CHN card (same sources, ...): partner and BRICS co-founder, ..." (29 con due punti, 37 con frase lunga): si toglie il tratto prima dei due punti e si
  mette la maiuscola;
- le 697 tra note e righe che dicono "X has not written its reading of Y; the atlas mirrors Y's 'partner' reading as 'partner' at low confidence,
  on the same evidence" sono il testo automatico delle stance riflesse: **non le tocco**, il sito le segnala gia' come "mirrored".

Esempi (da `stances/AGO.yaml` e `stances/BRA.yaml`)
PRIMA: "Mirror of the PRT card's stance toward AGO (partner, kin, same sources, not re-researched). ..." (AGO->PRT)
DOPO:  (frase tolta, la nota comincia dal fatto)
PRIMA: "Mirror of the CHN card (same sources, the grade is Brazil's own reading): partner and BRICS co-founder, Lula's April 2023 visit with 15 memoranda,..." (BRA->CHN)
DOPO:  "Partner and BRICS co-founder, Lula's April 2023 visit with 15 memoranda,..."

Elenco completo, un luogo per riga (file, indice, destinatario, tipo, frase): `scratchpad/mirror_list.tsv`
(404 righe), prodotto da `scratchpad/mirror.py`. Se vuoi, lo porto dentro la cartella `tools/`.
Domanda: tutte le 404, oppure solo le 172 in cui la frase e' la prima? Per me tutte (la provenienza e' nel git).
Fonte: nessun fatto nuovo.

---

# Parte C. Date, schede incomplete, asimmetrie, fonti, unita' (rapporto dati)

## 13. Dodici elementi con `last_verified` precedente alla loro fonte piu' recente (I8)
Ho rifatto il controllo con uno script (`i8.py` nello scratchpad): sono esattamente gli stessi dodici del revisore. Propongo
di portare `last_verified` alla data della fonte piu' recente (ho letto le date nei file, nessuna ricerca). Differenze di
uno-tre giorni.

| File:riga (campo `last_verified`) | Che cos'e' | Ora | Fonte piu' recente | DOPO |
|---|---|---|---|---|
| actors/HUN.yaml:15 | scheda HUN | 2026-10-12 | Council of the EU, General Affairs Council, 13 Oct 2026 (HUN.yaml:29) | 2026-10-13 |
| actors/SOM.yaml:12 | scheda SOM | 2026-10-12 | Somali Guardian, "Somalia's government loses Burhakabo...", 15 Oct 2026 (SOM.yaml:46) | 2026-10-15 |
| actors/org-eu.yaml:15 | scheda org-eu | 2026-10-12 | Council of the EU, GAC, 13 Oct 2026 | 2026-10-13 |
| stances/HUN.yaml:8 | HUN->org-eu | 2026-10-12 | Council of the EU, GAC, 13 Oct 2026 | 2026-10-13 |
| stances/JOR.yaml:62 | JOR->EGY | 2026-10-12 | Jordan News, "Regional Power Links...", 13 Oct 2026 (JOR.yaml:69) | 2026-10-13 |
| stances/org-eu.yaml:950 | org-eu->HUN | 2026-10-12 | Council of the EU, GAC, 13 Oct 2026 | 2026-10-13 |
| relations/HUN.yaml:10 | HUN->org-eu, influence_goal | 2026-10-12 | Council of the EU, GAC, 13 Oct 2026 | 2026-10-13 |
| relations/HUN.yaml:429 | HUN->org-eu, investment | 2026-10-12 | idem | 2026-10-13 |
| relations/JOR.yaml:183 | JOR->EGY, energy_import | 2026-10-12 | Jordan News, 13 Oct 2026 | 2026-10-13 |
| relations/org-eu.yaml:142 | org-eu->HUN, influence_goal | 2026-10-12 | Council of the EU, GAC, 13 Oct 2026 | 2026-10-13 |
| relations/org-eu.yaml:618 | org-eu->HUN, investment | 2026-10-12 | idem | 2026-10-13 |
| relations/org-eu.yaml:1218 | org-eu->HUN, incident | 2026-10-12 | idem | 2026-10-13 |

Perche': una data di verifica non puo' essere piu' vecchia della fonte che dice di aver verificato. La guardia nel build
(IDEA 1 del revisore) e' una modifica al codice, non a una scheda: non e' in questo documento.
Fonte: le date sono quelle gia' scritte nelle fonti.

## 14. LCA · scheda piena senza file di stance: due stance scrivibili senza ricerca nuova (I10)
Cosa c'e': `actors/LCA.yaml` (tier minor, ultima verifica 16 ott 2026, ogni riga C perche' la sola fonte e' Wikipedia,
tier 4) e `relations/LCA.yaml` (due righe: TWN, GBR). Nessuna stance di altre schede verso LCA. Il build avverte "LCA: full
card but no stances file" e la mappa dal punto di vista di Saint Lucia non ha niente.
Cosa si puo' scrivere dalle fonti che la scheda ha gia' (la voce di Wikipedia "Foreign relations of Saint Lucia", letta il
16 ott, e "Foreign relations of Taiwan" oldid 1378208098): due stance, sullo stesso modello delle due di VCT (che gia' dicono
"our reading, confidence C"). Il file nuovo `data/stances/LCA.yaml`:

```yaml
actor: LCA
stances:
- toward: TWN
  grade: partner
  trend: stable
  bond: none
  since: '2007-04-30'
  last_verified: '2026-10-16'
  confidence: C
  note: 'Full diplomatic relations with the Republic of China (Taiwan), restored on 30 April 2007 after Saint Lucia had recognised the People''s Republic from 1997; the embassy in Taipei opened on 4 June 2015, described as its first in Asia. Grade partner, trend stable and bond none are our reading (confidence C): no source read uses these words, the only sources are Wikipedia pointers (tier 4), and the government elected in 2025 has not been checked.'
  sources:
  - url: https://en.wikipedia.org/wiki/Foreign_relations_of_Saint_Lucia
    title: Foreign relations of Saint Lucia (read via the Wikipedia API)
    publisher: Wikipedia (index)
    date: '2026-10-16'
    tier: 4
  - url: https://en.wikipedia.org/w/index.php?title=Foreign_relations_of_Taiwan&oldid=1378208098
    title: Foreign relations of Taiwan
    publisher: Wikipedia (index)
    date: '2026-10-12'
    tier: 4
- toward: GBR
  grade: partner
  trend: stable
  bond: none
  since: '1979-02-22'
  last_verified: '2026-10-16'
  confidence: C
  note: 'Diplomatic relations since 22 February 1979, high commissions in London and Castries, Commonwealth membership and the CARIFORUM-UK Economic Partnership Agreement. Grade partner, trend stable and bond none are our reading (confidence C): no source read uses these words and the only source is the Wikipedia article on Saint Lucia''s foreign relations (tier 4).'
  sources:
  - url: https://en.wikipedia.org/wiki/Foreign_relations_of_Saint_Lucia
    title: Foreign relations of Saint Lucia (read via the Wikipedia API)
    publisher: Wikipedia (index)
    date: '2026-10-16'
    tier: 4
```
Attenzione: la regola stretta dell'ONTOLOGY ("un grado ha bisogno di una fonte che usi quella lettura") escluderebbe anche queste due; la prassi
del progetto (VCT, LUX, GRC e molte altre) le ammette a confidenza C dichiarate "our reading". Dimmi quale delle due vale.
Cosa NON si puo' scrivere: una stance verso gli Stati Uniti. La scheda dice solo che il transito della droga e' "la fonte della
tensione" con gli USA, "per la prima frase di Wikipedia": non dice una postura, e non ho altro. Servirebbe la ricerca che
la scheda stessa rimanda ("until a sourced pass").
Perche': dopo `reciprocate.py` la riflessa di TWN->LCA e GBR->LCA verrebbe segnata come rispecchiamento. Il grado `partner`
non e' una nostra opinione piu' di quanto lo sia nelle stance di VCT: e' scritto "our reading" con confidenza C, come la regola
dei gradi richiede quando nessuna fonte usa la parola.
Fonte: le due voci di Wikipedia, gia' citate nella scheda.

## 15. VCT · scheda piena senza file di relazioni: non si puo' scrivere niente senza ricerca nuova (I10)
Cosa c'e': le stance di VCT (TWN, USA) e la scheda. Le righe che la scheda potrebbe dare le ha gia' il dataset: il
riconoscimento di Taipei (`_recognition.yaml:10770`, `since: null`), il non-riconoscimento del Kosovo e il riconoscimento della
Palestina (dal 2011-08-29), le appartenenze (Commonwealth, OAS, ONU, OMC, in `_wikidata.yaml`). Una riga a mano per Taiwan
sarebbe un doppione: la scheda stessa dice che la data di inizio "non e' sourced". L'unico fatto a mano e' il vertice
di Bridgetown del maggio 1997 con Clinton ("justice, counternarcotics, finance and trade"), dato dal puntatore Wikipedia (tier
4): non e' un trattato, non e' una visita di VCT, non ha esito: nessun tipo del vocabolario lo contiene senza inventare.
Proposta: nessun file nuovo. Il build non avverte per le relazioni mancanti. Se vuoi comunque righe a mano, serve una ricerca
(governo post-novembre 2025, Venezuela, Cuba, Cina), come dice la lettura della scheda stessa.

## 16. Asimmetrie tra schede piene (I11): le 16 coppie con le due letture e un giudizio
Ho controllato i due lati in `data/stances/`. Il build avverte solo quando il lato ostile e' adversary o claimed territory
(`build.py:424`): qui il lato ostile e' sempre rival. Dice la riga se l'asimmetria e' **strutturale** (le due schede dicono
cose diverse perche' le posizioni sono diverse) o un **difetto**. Cambio solo dove e' un difetto.

| Coppia (A legge B / B legge A) | Lettura A | Lettura B | Giudizio |
|---|---|---|---|
| ARE / ERI | partner, cooling, C | rival, cooling, C | difetto lieve: la stance ARE dice di essere un "lapsed lease" senza prove 2026; la nota ERI chiede di risolverla. Voce 18. |
| ARE / LBY | partner, stable, C | rival, stable, C | strutturale: "Libya" in ARE e' l'est (Haftar), in LBY e' Tripoli; si risolve con l'attore "Libia orientale" gia' nel BACKLOG. |
| BRA / USA | reluctant_partner, cooling, C | rival, warming, C | strutturale: le due note lo dicono (i dazi americani, il mercato di cui il Brasile ha bisogno). |
| CHN / AUS | partner, warming, B | rival, warming, C | strutturale: commercio contro posizione di sicurezza. Resta da pulire la nota AUS (voce 9). |
| DOM / HTI | reluctant_partner, cooling, C | rival, stable, C | strutturale: muro e frontiera, ma Santo Domingo coopera alla missione. |
| FRA / COM | partner, stable, B | rival, stable, C | strutturale: la rivendicazione di Mayotte. |
| GRC / LBY | partner, warming, C | rival, stable, C | strutturale e invecchiata: la nota GRC poggia su una promessa del 2025 ormai smentita. Voce 25. |
| HUN / BIH | partner, cooling, C | rival, warming, C | strutturale sotto Orban; probabilmente invecchiata col nuovo governo (la nota HUN dice che non ha trovato fonti sulla linea Magyar). Nessuna modifica senza ricerca. |
| IND / CAN | reluctant_partner, warming, B | rival, warming, C | **difetto**: la nota CAN dice di essere lo specchio della scheda IND e descrive lo stesso disgelo, ma ha il grado di prima. Voce 17. |
| IRL / ISR | reluctant_partner, cooling, C | rival, cooling, C | strutturale: Israele ha chiuso l'ambasciata a Dublino (15 dic 2024); la nota ISR lo argomenta. |
| ISR / NOR | reluctant_partner, cooling, C | rival, cooling, C | dubbio, non lo cambio: e' il rovescio di IRL/ISR (stesso fatto, il riconoscimento del 28 mag 2024: Irlanda legge Israele reluctant_partner e Israele legge Irlanda rival; la Norvegia legge Israele rival e Israele legge la Norvegia reluctant_partner). Serve leggere le fonti di entrambe le note per decidere. Decisione tua. |
| RUS / ISR | reluctant_partner, cooling, C | rival, cooling, C | strutturale: Mosca tiene il canale, Israele ha colpito l'Iran, partner di Mosca. |
| VAT / CHN | reluctant_partner, stable, B | rival, stable, C | strutturale per la regola Taiwan (la Santa Sede riconosce Taipei); la nota CHN lo dice. |
| nsa-hezbollah / LBN | reluctant_partner, cooling, C | rival, cooling, C | strutturale: uno Stato e un attore armato dentro di esso. |
| nsa-sdf / SYR | reluctant_partner, warming, C | rival, warming, B | strutturale: Damasco punta a "the end of an autonomous armed force"; l'SDF si e' sciolta il 25 ago 2026. Il grado rival di Damasco puo' essere da rivedere dopo lo scioglimento, ma la nota lo argomenta. |
| sub-rs / MNE | partner, stable, C | rival, stable, C | strutturale: RS parla con i partiti serbi e il presidente del Parlamento, non con lo Stato montenegrino. |

Perche': in 11 coppie su 16 l'asimmetria e' la struttura (chi agisce contro chi); due sono strutturali ma invecchiate
(GRC/LBY, HUN/BIH); un caso e' un vero difetto (IND/CAN), uno e' un residuo (ARE/ERI), uno e' dubbio (ISR/NOR). Fonte: nessun fatto nuovo.

## 17. CAN->IND · il grado e' rimasto quello di prima del disgelo (data/stances/CAN.yaml:152 e 158)
Il lato indiano (`stances/IND.yaml:634`, ultima verifica 12 ott) e' `reluctant_partner`, warming, B: "From rupture to reset
... under Carney both restored high commissioners, restarted trade talks ... 10-year Cameco uranium supply deal". Il lato
canadese (ultima verifica 16 ott, piu' recente) racconta lo stesso disgelo ma lascia `rival`. Il "rival" descrive la rottura 2023-24,
non la situazione di oggi.

Campo `grade` (CAN.yaml:152)
PRIMA: "grade: rival"
DOPO:  "grade: reluctant_partner"
Nota (CAN.yaml:158)
PRIMA: "Mirror of the IND card read from Ottawa: the 2023 allegation of an Indian link to the killing of Hardeep Singh Nijjar and the October 2024 expulsions of diplomats put the pair at rival level, a rival with a grievance. Warming under Carney: high commissioners restored, trade talks restarted, the 10-year uranium deal with Cameco (March 2026, about USD 1.9bn) and a CEPA aimed at end-2026."
DOPO:  "From Ottawa, the same reading as the IND card: the 2023 allegation of an Indian link to the killing of Hardeep Singh Nijjar and the October 2024 expulsions of diplomats put the pair at rival level, with a grievance; under Carney the thaw makes it a reluctant partner: high commissioners restored, trade talks restarted, the 10-year uranium deal with Cameco (March 2026, about USD 1.9bn) and a CEPA aimed at end-2026."
Resto della nota (Not a settled trust..., Confidence C, Gap) invariato. Trend (warming), bond (grievance) e confidenza (C) restano.
Perche': le due schede, entrambe a mano, devono dire la stessa cosa del disgelo; la confidenza resta C perche' la rottura non ha
un URL su questa scheda. Fonte: le stesse della nota (stampa di marzo 2026) e quelle della scheda IND; nessun fatto nuovo.
Nota: e' un cambio di grado, che per regola va fatto a mano con la nota riscritta: eccola. Serve il tuo ok.

## 18. ARE->ERI · "partner" senza prove nel 2026 (data/stances/ARE.yaml:437 e 443)
La nota dice che la base di Assab e' un "lapsed lease" (smantellata dopo il 2021), che non c'e' alcuna prova di presenza o
accordo nel 2026, e la stance ERI->ARE (`stances/ERI.yaml`) chiede espressamente di "resolve in review". Se non c'e'
postura attuale, il grado dell'atlante e' `neutral` ("no significant posture"), non `partner`.

Campo `grade` (ARE.yaml:437) e `trend` (ARE.yaml:438)
PRIMA: "grade: partner" / "trend: cooling"
DOPO:  "grade: neutral" / "trend: stable"
Nota (ARE.yaml:443)
PRIMA: "Assab was the UAE's base for the Yemen war (port and airstrip from September 2015); satellite images analysed by the AP showed the UAE dismantling it after it left the Yemeni front (2021). No 2026 evidence of any presence or agreement was found; the stance records the tie as a lapsed lease. Cooling, confidence C."
DOPO:  "Assab was the UAE's base for the Yemen war (port and airstrip from September 2015); satellite images analysed by the AP showed the UAE dismantling it after it left the Yemeni front (2021). No 2026 evidence of any presence or agreement was found, so the lapsed lease leaves no posture to grade: neutral, confidence C. Eritrea's own card reads the UAE as a rival, because the UAE now sits on Ethiopia's side of the Red Sea divide; no UAE source on Eritrea was found."
Perche': e' un residuo, non una scelta: il grado "partner" non ha piu' nulla sotto. Il grado e' piu' prudente di "rival"
perche' per "rival" servirebbe una fonte emiratina. Fonte: AP, "UAE dismantles Eritrea base as it pulls back after Yemen war", feb
2021, gia' nella stance. Serve il tuo ok (cambio di grado e di trend).

## 19. PER->CHN · due valori per la stessa quantita' (data/relations/PER.yaml:4 e :85)
La riga 0 (quota di esportazioni verso la Cina nel 2025: 32%, da un'indicazione di ricerca non aperta, C) e la riga 5 (36,2%,
Mincetur via Infomercado del 3 feb 2026, B) sono entrambe vive sul registro. La nota della riga 0 dice "Superseded ... Row kept
as the earlier reading". La regola dell'ONTOLOGY (lezione 3) e': vince il valore piu' recente con base ufficiale e la
discrepanza si scrive nella nota. Propongo di togliere la riga 0 e di tenere la discrepanza nella nota della riga 5 (la
fonte Baird Maritime resta nominata).

Riga 0 (PER.yaml:4-17)
PRIMA: la riga intera "China took 32% of Peru's exports in 2025, a record export year (trade ministry, as reported in the Baird Maritime piece on Chancay; not verified against the ministry itself)..." (value 0.32, share_of_exports, C)
DOPO:  (riga tolta)
Nota della riga 5 (PER.yaml:85)
PRIMA: "Conflicts with the earlier 32% row above (a snippet attributed to the trade ministry); the Mincetur figure read here is the more recent with an official basis and wins. Not read on the Mincetur site itself."
DOPO:  "An earlier reading of 32% (a search-result snippet attributed to the trade ministry, in a Baird Maritime piece on Chancay; not fetched) is superseded by this figure, the more recent with an official basis. Not read on the Mincetur site itself."
Perche': due righe vive con numeri diversi sul registro della Cina in Peru'. L'alternativa (un campo `superseded: true` e una riga di
codice in build) e' piu' lavoro e lascia il numero sbagliato nei file. Fonte: nessun fatto nuovo.

## 20. Stesso URL con tier diversi (I13a): 20 indirizzi, 32 righe da cambiare
Ho ricontato (`i13.py`): sono 20 gli URL con piu' di un tier, non 14. Regola che ho usato: il tier di un URL e' quello che
la **classe dell'editore** gli da' nella maggioranza dei casi in cui lo stesso sito compare nei file; per i siti governativi e ONU
vince 1, per i think tank 2, per la stampa e gli studi legali 3, per i siti minori 4. Sei degli URL (sei righe) hanno il tier
sbagliato per colpa del generatore: `tools/datasets/recognition.py:185` mette **tier 3 a ogni citazione presa da Wikipedia**
anche quando e' un documento di governo; si corregge nel generatore (tier per dominio: .gov, .gouv, admin.ch, un.org -> 1)
e si rigenera, non a mano.

| URL (inizio) | Tier trovati (righe) | Tengo | Righe da cambiare |
|---|---|---|---|
| gouvernement.lu/.../22-frieden-ny-palestine | 1 (LUX), 3 (dataset) | 1 | 1 (dataset) |
| undocs.org/en/A/78/846 | 1 (x2), 3 (dataset) | 1 | 1 (dataset) |
| web.archive.org/.../itamaraty.gov.br/...reconhecimento | 1 (x2), 3 (dataset) | 1 | 1 (dataset) |
| eda.admin.ch/.../switzerland-kosovo.html | 1 (x2), 3 (dataset) | 1 | 1 (dataset) |
| foreignminister.gov.au/.../australia-recognises-state-palestine | 1 (x3), 3 (dataset) | 1 | 1 (dataset) |
| gov.si/en/news/2024-06-05-... | 1 (x2), 3 (dataset) | 1 | 1 (dataset) |
| hornreview.org/2026/08/31/the-geopolitics-of-legitimacy... | 2 (x5), 4 (x1) | 3 (maggioranza del sito: 32 su 38) | 6 |
| investortrust.id/market/108676/prabowo-awards... | 4 (x2), 3 (x1) | 4 | 1 |
| kabulnow.com/2026/06/pakistan-says-2-4-million... | 3 (x3), 4 (x2) | 4 (19 su 23 nel sito) | 3 |
| sanctionsnews.bakermckenzie.com/gcc-and-egypt... | 3 (x5), 2 (x1) | 3 (studio legale) | 1 |
| aa.com.tr/en/middle-east/syria-closes-border-crossing... | 3 (x2), 4 (x1) | 3 | 1 |
| csis.org/analysis/what-australia-and-fijis-new-treaty... | 2 (x6), 3 (x1) | 2 | 1 |
| fdd.org/analysis/2026/03/09/cypriot-lebanese-officials... | 2 (x5), 3 (x1) | 2 | 1 |
| iranintl.com/en/202603199101 | 3 (x4), 4 (x2) | 3 | 2 |
| iranintl.com/en/202607147249 | 3 (x12), 4 (x1) | 3 | 1 |
| longwarjournal.org/archives/2026/02/stabilization-force... | 2 (x3), 3 (x2) | 2 (38 su 63 nel sito) | 2 |
| middleeasteye.net/news/kuwait-citizenship-crackdown... | 3 (x4), 2 (x1) | 3 | 1 |
| news4jax.com/news/world/2026/10/05/russia-hosts-consultations... (copia AP) | 3 (x7), 1 (x1, relations/AFG) | 3 | 1 |
| securitycouncilreport.org/monthly-forecast/2026-05/bosnia-and-herzegovina-15.php | 2 (x28), 3 (x1, relations/sub-rs) | 2 | 1 |
| whitecase.com/insight-alert/eu-provisionally-apply-eu-mercosur... | 2 (x4: ARG), 3 (x3: org-eu) | 3 (studio legale, come Baker McKenzie e WilmerHale) | 4 |

`globalsecurity.org` (tier 1 in 75 citazioni, tier 3 in 47) non e' nell'elenco perche' gli URL sono diversi: il tier giusto dipende
da che cosa ospita la pagina (copia di un documento ufficiale: 1; testo proprio o notizia: 3). Non lo cambio senza aprire le pagine;
propongo solo la regola. Se vuoi, lo script `i13.py` elenca ogni riga con file e indice.
Perche': oggi il conteggio per tier nella pagina Data dipende dall'ordine in cui il build legge i file (tiene il primo).
Fonte: nessun fatto nuovo.

## 21. Nomi degli editori scritti in modi diversi (I13b): le dieci varianti piu' frequenti
Nei file ci sono 3.177 stringhe `publisher` diverse. Le dieci varianti di ortografia che toccano piu' righe (contate da
`i13d.py`), con la forma che propongo:

| PRIMA | DOPO | Righe |
|---|---|---|
| "AP via WTOP", "AP (via ABC News)", "Associated Press via AOL"... | "Associated Press (via WTOP)", "Associated Press (via ABC News)"... | 244 |
| "Reuters via Internazionale", "Reuters via Yahoo News"... | "Reuters (via Internazionale)", "Reuters (via Yahoo News)"... | 179 |
| "allAfrica", "allAfrica (Togonews)"... | "AllAfrica", "AllAfrica (Togonews)"... | 174 |
| "AP", "AP News" | "Associated Press" | 102 |
| "BBC" | "BBC News" | 78 |
| "Wikipedia (index, tier 4 pointer)", "Wikipedia (index only)", "Wikipedia (index, not source of record)"... | "Wikipedia (index)" | 30 |
| "The Times of Central Asia" | "Times of Central Asia" | 27 |
| "Brussels Times" | "The Brussels Times" | 23 |
| "The Business Standard" | "Business Standard" | 20 |
| "Reuters (via Yahoo)" | "Reuters (via Yahoo News)" | 18 |

Fuori dalle dieci, stessa natura: "US/U.S. Department of State" (29/19), "US/U.S. Department of the Treasury" (34/18), "The East African"
(16) / "The EastAfrican" (76), "TimesLive" (12) / "TimesLIVE" (34). "The Guardian (Nigeria)" e "Guardian (Trinidad and Tobago)" sono
altri giornali, non varianti: non si toccano.
Perche': la pagina Data e le note a pie' pagina contano gli editori come stringhe; "AP" e "Associated Press" risultano due editori.
Si fa con una sostituzione esatta per stringa, senza guardare gli altri campi. Fonte: nessun fatto nuovo.

## 22. URL dell'Uruguay con la virgola finale (C2) e un errore di battitura in 80 titoli
Riga: `data/relations/_recognition.yaml:7430` (URY->PSE): `http://www.mrree.gub.uy/gxpsites/hgxpp001?7,1,778,O,S,0,PAG;CONC;45;5;D;7663;1;PAG;,`.
Proposta: **non cambiarla**. E' l'indirizzo come Wikipedia lo cita; indirizzi di questo tipo (il formato `hgxpp001?...` e' di GeneXus)
sembrano finire con una virgola, ma non l'ho potuto provare; e' l'unico URL di quel sito nei file. Ho provato due volte a raggiungere l'host
(con e senza virgola) e non ha risposto in 15 secondi: non posso dire quale delle due forme funzioni. Se preferisci togliere la
virgola, e' una cosa non verificata.

Un errore vero, invece, nello stesso file e nello stesso generatore: 80 titoli di fonte dicono "Citation under the the State of
Palestine row" (il nome contiene gia' "the"). Si corregge in `recognition.py:185` e si rigenera.
PRIMA: "Citation under the the State of Palestine row in Wikipedia's list (URY)"
DOPO:  "Citation under the State of Palestine row in Wikipedia's list (URY)"
Fonte: nessun fatto nuovo.

## 23. Unita' scritte come prosa (C3): 8 righe, il campo numerico e l'unita'
Il build richiede solo che `value` e `unit` ci siano. Le prime quattro righe YEM sono quelle del revisore; le altre tre (490, 712, 747) le ho trovate io con lo stesso criterio. Il resto del registro usa unita' in snake_case con l'anno
(`usd_million_feb2021_dec2022`, `share_of_exports_2025`). Per le righe qui sotto il `value` e' gia' numerico; cambia solo `unit`
(la spiegazione e' gia' nel `summary`). Per ISL il valore e' una stringa e la pagina Levers lo conta come numero:
`value: null` e' il modo che il build gia' tratta come "senza numero" (`build.py:856`, `:905`).

| File:riga | PRIMA | DOPO |
|---|---|---|
| relations/YEM.yaml:281 (energy_export) | `value: 0` `unit: barrels of government crude exported since the Oct 2022 terminal attacks (blocked)` | `value: 0` `unit: barrels_exported_since_oct_2022` |
| relations/YEM.yaml:307 (investment, SAU) | `value: 347` `unit: USD million, Saudi grant for the deficit and wage bill (2026)` | `value: 347` `unit: usd_million_2026` |
| relations/YEM.yaml:328 (investment, SAU) | `value: 90` `unit: USD million, Saudi package for delayed salaries (2026)` | `value: 90` `unit: usd_million_2026` |
| relations/YEM.yaml:344 (investment, SAU) | `value: 507` `unit: USD million, Saudi development programme (2026)` | `value: 507` `unit: usd_million_2026` |
| relations/YEM.yaml:490 (military_presence, ARE) | `value: 0` `unit: Emirati combat/counter-terrorism units remaining in Yemen` | `value: 0` `unit: units_remaining` |
| relations/YEM.yaml:712 (military_presence) | `value: 1320` `unit: commercial vessels secured by Operation Aspides since Feb 2024` | `value: 1320` `unit: vessels_secured_since_feb_2024` |
| relations/YEM.yaml:747 (investment) | `value: 27.8` `unit: per cent of the 2025 humanitarian response plan funded` | `value: 27.8` `unit: percent_of_2025_response_plan_funded` |
| relations/ISL.yaml:41 (military_presence, USA) | `value: rotational_year_round` `unit: not_quantified` | `value: null` `unit: not_quantified` |

Perche': le unita' compaiono come etichette nella pagina Levers e nel registro; le frasi lunghe rompono la riga. Nessuna cifra cambia.
Fonte: nessun fatto nuovo (le cifre sono quelle della riga).

## 24. sub-western-sahara senza `parent` (C4) (data/actors/sub-western-sahara.yaml, dopo la riga `tier: minor`)
Gli altri 25 attori `sub-*` hanno tutti `parent`. Nessun codice lo legge, ma ONTOLOGY (lezione 1) lo chiede. Qui la scelta e' politica,
non tecnica: l'ONU non riconosce la sovranita' del Marocco e il Sahara Occidentale e' un territorio non autonomo. La convenzione
nei file e' mista: lo Stato che amministra (sub-falklands e sub-chagos `GBR`, sub-mayotte `FRA`) o quello de jure (sub-crimea `UKR`,
sub-somaliland `SOM`, sub-greenland `DNK`). Per il Sahara Occidentale non c'e' uno Stato de jure. La scheda MAR lo legge `own_territory` ("Rabat administers the territory it claims", risoluzione 2797 del
31 ott 2025; "'own_territory' is Rabat's reading, not a legal finding").
PRIMA: (nessun campo `parent`)
DOPO:  `parent: MAR`
Alternativa: lasciare senza campo e scrivere in ONTOLOGY che `parent` manca di proposito quando nessuno Stato ha la sovranita'.
Io propongo `parent: MAR`, con la convenzione di Falkland, Chagos e Mayotte (chi amministra), ma e' una scelta politica: e' tua.
Fonte: `data/stances/MAR.yaml` (Marocco, sub-western-sahara), gia' nei file: risoluzione 2797 del Consiglio di sicurezza, 31 ott 2025.

---

# Parte D. I tre flag per la mano dopo W44 (BACKLOG, 29 ottobre)

## 25. GRC · la promessa dell'ottobre 2025 sulla Libia orientale e' stata smentita il 20 ottobre 2026 (tre punti)
Cosa dicono le fonti nei file: il 20 ott 2026 la Camera dei rappresentanti della Libia orientale ha approvato il memorandum
marittimo turco-libico del 2019 e ha revocato le due decisioni del 2020 che lo respingevano (Reuters, 20 ott); il governo di Tripoli
ha accolto bene il voto; il ministero degli Esteri greco ha dichiarato lo stesso giorno che l'approvazione non cambia la natura
"illegal, invalid and groundless" del memorandum e Atene ha informato il Consiglio di sicurezza nei giorni seguenti (comunicato
del ministero, 20 ott 2026, tier 1; Al Jazeera, 22 ott). Sono gia' nelle righe LBY->GRC e LBY->TUR
(`relations/LBY.yaml:872-905`) e nella scheda LBY (`actors/LBY.yaml:109`): le riuso, nessuna ricerca nuova. La fonte della
"promessa" (Libya Security Monitor, ott 2025) dice "allegedly".

a) Obiettivo 5 della scheda (actors/GRC.yaml:128)
PRIMA: "Close the southern route: contain irregular arrivals from eastern Libya to Crete, stop the 2019 Turkey-Libya maritime memorandum from being ratified, and open a delimitation track with Libya (Gerapetritis in Benghazi, March 2026; Saddam Haftar in Athens, 15 June 2026) while the asylum freeze stays in reserve."
DOPO:  "Close the southern route: contain irregular arrivals from eastern Libya to Crete, contest the 2019 Turkey-Libya maritime memorandum (the eastern House of Representatives approved it on 20 Oct 2026; Athens answered that the vote does not alter its 'illegal, invalid and groundless' nature and briefed the UN Security Council), and open a delimitation track with Libya (Gerapetritis in Benghazi, March 2026; Saddam Haftar in Athens, 15 June 2026) while the asylum freeze stays in reserve."
Fonti da aggiungere all'obiettivo: Hellenic Ministry of Foreign Affairs, "Announcement ... on the decision of the Libyan House of Representatives concerning the Turkish-Libyan memorandum", 20 ott 2026, tier 1
(https://www.mfa.gr/en/announcement-by-the-ministry-of-foreign-affairs-on-the-decision-of-the-libyan-house-of-representatives-concerning-the-turkish-libyan-memorandum-20-10-2026/);
Reuters, "Eastern Libya parliament approves maritime deal with Turkey, lifts 2020 boycott", 20 ott 2026, tier 3
(https://www.reuters.com/world/europe/eastern-libya-parliament-approves-maritime-deal-with-turkey-lifts-2020-boycott-2026-10-20/);
Al Jazeera, "What is the Turkiye-Libya maritime deal, and why are the EU, Egypt opposed?", 22 ott 2026, tier 3.

b) Stance GRC->LBY, nota (stances/GRC.yaml:446)
PRIMA: "A split partner. Greece works with the eastern authorities (Gerapetritis in Benghazi, Mar 2026; Saddam Haftar in Athens, 15 Jun 2026; reported assurance in Oct 2025 that the House will not ratify the Turkey-Libya memorandum - unconfirmed) on migration, coast-guard vessels and a future delimitation track, while rejecting the 2019 Turkey-Libya memorandum as void with Tripoli's government and Turkey."
DOPO:  "A split partner. Greece works with the eastern authorities (Gerapetritis in Benghazi, Mar 2026; Saddam Haftar in Athens, 15 Jun 2026) on migration, coast-guard vessels and a future delimitation track, while rejecting the 2019 Turkey-Libya memorandum as void with Tripoli's government and Turkey. An assurance reported in Oct 2025 that the eastern House would not ratify it was overtaken on 20 Oct 2026, when the House approved the memorandum; Athens answered that the vote changes nothing in its 'illegal, invalid and groundless' nature and briefed the UN Security Council."
Stesse due fonti nuove (MFA greco e Al Jazeera) nella lista delle fonti; la fonte Libya Security Monitor di ott 2025 resta, perche' regge la frase sulla promessa.
Campo `trend` (stances/GRC.yaml:441): PRIMA "warming" / DOPO "stable" - facoltativo, tua decisione. Il canale Atene-Bengasi cresceva
fino a giugno; il voto del 20 ott va contro l'obiettivo greco, ma nei file non c'e' alcuna fonte su contatti greci con Bengasi dopo
il voto. "Stable" = nessuna prova nei due sensi. `grade: partner` e `last_verified` (riga 444, a 2026-10-29) restano/si aggiornano.

c) Riga GRC->LBY, obiettivo (relations/GRC.yaml:892)
PRIMA: "Greece rejects the 2019 Turkey-Libya maritime memorandum as illegal and void (a letter to the UN) and seeks its own maritime delimitation with Libya: a roadmap targeted for end-2025 and talks with eastern Libya in 2026; a reported assurance (Oct 2025, unconfirmed) that the eastern House will not ratify the memorandum."
DOPO:  "Greece rejects the 2019 Turkey-Libya maritime memorandum as illegal and void (a letter to the UN) and seeks its own maritime delimitation with Libya: a roadmap targeted for end-2025 and talks with eastern Libya in 2026. The assurance reported in Oct 2025 that the eastern House would not ratify the memorandum was overtaken on 20 Oct 2026, when the House approved it; Athens said the vote does not alter the memorandum's 'illegal, invalid and groundless' nature and briefed the UN Security Council."
Fonti nuove: le stesse due; `last_verified` (riga 896) a 2026-10-29.

Perche': oggi la scheda greca dice due cose opposte (una promessa, e il fatto contrario nella scheda libica). Le stesse frasi
vanno tradotte il giorno stesso (schede) o restano in inglese (note e righe). Fonte: vedi sopra, tutte gia' in `relations/LBY.yaml`.

## 26. HTI · la forza della missione: 1.500 nella scheda, "oltre 2.000" per l'AP (BACKLOG, 29 ottobre)
Ho letto la fonte AP che la scheda cita (AP via AJC, "Bukele says military operation launched to rescue Salvadorans held by
gangs in Haiti"; la pagina che ho aperto porta la data 22 ott 2026, la scheda la data 21 ott; l'altro articolo AP, via WSB-TV,
e' bloccato fuori dagli USA). Dice: "with more than 2,000 troops on the ground in Haiti", e che l'ONU nel 2025 approvo' "up to 5,550
security personnel and more than 50 civilian staff". I 1.500 sono di Reuters (via TimesLIVE) del 29 set 2026, al rinnovo del mandato;
Reuters del 21 ott parla di "roughly a third" della forza prevista (circa 1.850), coerente con "oltre 2.000" dell'AP. Sono due conteggi
di date e fonti diverse, non una smentita.

a) Obiettivo 2 (actors/HTI.yaml:28)
PRIMA: "...About 1,500 troops were in place when the mandate was renewed on 29 September 2026, and the Kenyan contingent is being replaced by Chadian troops. Reuters put the force at roughly a third of its planned size on 21 October, and Sri Lanka has also deployed soldiers."
DOPO:  "...About 1,500 troops were in place when the mandate was renewed on 29 September 2026 (Reuters), and more than 2,000 by 22 October (AP); Reuters put the force at roughly a third of its planned size on 21 October. The Kenyan contingent is being replaced by Chadian troops, and Sri Lanka has also deployed soldiers."
Fonte da aggiungere all'obiettivo: Associated Press (via AJC), "Bukele says military operation launched to rescue Salvadorans held by gangs in Haiti", 22 ott 2026, tier 3
(https://www.ajc.com/news/2026/10/bukele-says-military-operation-launched-to-rescue-salvadorans-held-by-gangs-in-haiti/), gia' nella scheda ai mezzi.

b) Mezzi, dominio militare (actors/HTI.yaml:37)
PRIMA: "Pledges are not deployments; the troops in place are about 1,500."
DOPO:  "Pledges are not deployments; the troops in place are more than 2,000 (AP, 22 October), against about 1,500 reported at the renewal of the mandate on 29 September (Reuters)."

c) Lettura (actors/HTI.yaml:69)
PRIMA: "...while the force holds about a quarter of its authorised strength and its own police are not yet rebuilt."
DOPO:  "...while the force holds about a third of its authorised strength and its own police are not yet rebuilt."

Perche': i tre punti della scheda devono dire lo stesso numero, e il numero piu' recente con una fonte tier 3 e' quello dell'AP.
Fonte: AP come sopra. Non risolto: la data della fonte (21 contro 22 ott); non l'ho cambiata.

## 27. nsa-houthis · "58 morti" a Shabwah, mentre la scheda YEM (e l'AP) dicono "almeno 53" (relations/nsa-houthis.yaml:406)
La scheda YEM (`relations/YEM.yaml:921-940`, ultima verifica 29 ott) ha gia' la riga corretta: strage al campo di addestramento
al-Alam, Shabwah, 19 ott 2026, "at least 53 security and police recruits" uccisi e oltre 200 feriti "per the Shabwa authorities
(preliminary, AP)"; i primi conteggi erano "at least 18" e "at least 20"; il numero "58 e 14 dispersi" viene dal portale (19 ott) e
"is not in the sources found". Riuso la stessa riga e le stesse fonti.

PRIMA: "A Houthi missile attack on a training centre in Shabwah Governorate killed 58 soldiers and injured over 200, with 14 missing (portal figures, 19 Oct). The cited Reuters URL slug reads 'at least 18 killed', so the toll was probably revised upward; check before using the number."
DOPO:  "A Houthi ballistic-missile strike on the al-Alam training camp in Shabwah on 19 Oct 2026 killed at least 53 security and police recruits and wounded over 200, per the Shabwa authorities (preliminary, AP). The first wire counts were at least 18 and at least 20. The Houthis acknowledged targeting the camp and said it was run by Saudi officers."
Nota della riga (campo `note`, da aggiungere): "The portal's 19 Oct figure of 58 killed and 14 missing is not in the sources found; the AP count (at least 53) is the latest with an official basis. Recheck before the next update."
Fonti da aggiungere: The Leader (AP), "Houthi rebels strike Yemeni govt forces, killing 53", 19 ott 2026, tier 3
(https://www.theleader.com.au/story/9371525/houthi-rebels-strike-yemeni-govt-forces-killing-53/); ClickOnDetroit (AP), "Houthi rebels strike a government military camp in southern Yemen, killing at least 20 fighters", 19 ott 2026, tier 3.
`last_verified` (a 2026-10-22) a 2026-10-29. Nella stance `nsa-houthis.yaml:10` non c'e' nessuna cifra: non si tocca.
Perche': le due schede dicono lo stesso numero con la stessa fonte. Le due righe del portale con "58" restano nella cartella
`data/inbox` (il build la ignora). Fuori dal mio incarico, visto passando: la riga RWA del 28 ott poggia ancora su un link Reuters mai aperto (JOURNAL).

---

# Che cosa non ho potuto risolvere

- Voce 4 (CHN): il titolo della fonte White & Case ("... a 50% rule ...") contro la soglia dello 0,1% scritta nella scheda; la pagina da' 403 e le chiamate web erano finite.
- Voce 22: l'indirizzo dell'Uruguay non risponde; non so se la virgola finale e' parte dell'indirizzo.
- Voce 16: ISR/NOR (due coppie speculari con letture opposte) e HUN/BIH (invecchiata col cambio di governo): servono le fonti di entrambe le note o una ricerca.
- Voce 14: se le stance con "our reading, confidenza C" valgono anche a Saint Lucia, o se vale la regola stretta dell'ONTOLOGY.
- Voce 25: il trend GRC->LBY (warming o stable) non e' decidibile dai file.
- Voce 26: la data dell'articolo AP (21 o 22 ottobre).

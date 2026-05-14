# Testimine

## Testimise ulatus

Rakendust testiti käsitsi põhilise kasutusvoo järgi:

1. ülesannete nimekirja kuvamine
2. ülesande valimine
3. küsimuste genereerimine
4. mängu mängimine
5. õlekõrte kasutamine
6. vale vastuse ja loobumise vood
7. tulemuse kuvamine

## Testjuhtumid ja tulemus

### 1. Ülesannete nimekiri

- Rakendus loeb `input/` kaustast kõik numbrilised alamkaustad.
- Kuvatakse iga ülesande ID ja pealkiri.
- Pealkiri võetakse `assignment.md` esimesest H1 pealkirjast.

Tulemus:
- Läbitud

### 2. Ülesande valimine

- Kasutaja klikib avalehel ülesande kaardile.
- Rakendus loeb valitud ülesande `assignment.md` faili ja lahendusfailid.
- Mäng käivitatakse valitud ülesande põhjal.

Tulemus:
- Läbitud

### 3. Küsimuste genereerimine

- OpenAI olemasolul tehakse päris API-päring.
- API puudumisel kasutatakse ülesandepõhiseid fallback-küsimusi.
- Küsimusi genereeritakse 15.
- Vastusevariante on 4.

Tulemus:
- Läbitud

### 4. Õige vastuse voog

- Vastus saadetakse backendile kontrollimiseks.
- Kuvatakse selgitus.
- Mäng liigub järgmise küsimuse juurde.
- Punktisumma uueneb.

Tulemus:
- Läbitud

### 5. Vale vastuse voog

- Vale vastuse korral mäng lõpeb.
- Kuvatakse õige vastus.
- Kuvatakse selgitus.
- Lõpptulemus langeb viimasele saavutatud turvatasemele.

Tulemus:
- Läbitud

### 6. Mängu katkestamine

- Kasutaja saab mängu pooleli jätta.
- Lõppskoor arvutatakse serveri seansi põhjal.

Tulemus:
- Läbitud

### 7. Õlekõrred

- `50:50` eemaldab kaks valet varianti.
- `Vihje` kuvab lühikese vihje.
- `Publiku hääletus` kuvab simuleeritud jaotuse.
- Iga õlekõrt saab kasutada ühe korra.

Tulemus:
- Läbitud

## Vastuvõtutingimuste kontroll

- Mitme ülesande tugi `input/` kaustas: täidetud
- Ülesande valik: täidetud
- `assignment.md` lugemine: täidetud
- Vähemalt ühe lahendusfaili lugemine: täidetud
- 15 küsimust: täidetud
- 4 vastusevarianti: täidetud
- Õige ja vale vastuse kontroll: täidetud
- Vale vastuse korral mängu lõpp: täidetud
- Tulemuse kuvamine: täidetud
- README käivitusjuhistega: täidetud

## Teadaolevad testimise piirangud

- Automaatseid teste ei ole veel lisatud.
- OpenAI vastuste kvaliteet võib erineda sessiooniti.
- Mobiilivaadet kontrolliti käsitsi, mitte automatiseeritult.

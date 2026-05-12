# Product Backlog - Miljonimäng

## Projekti Vision
Luua veebirakendus, mis aitab õppijatel kontrollida enda arusaamist kodeerimisülesannetest, kasutades AI-genereeritud küsimusi miljonimängu formatis.

---

## Backlogi staatus

| Kasutajalugu | Staatus | Seotud töö |
| --- | --- | --- |
| Ülesannete nimekirja nägemine | Valmis | `assignmentService.js`, `assignments.js`, avaleht |
| Ülesande valimine | Valmis | Avalehe kaardid ja mängu alustamine |
| AI küsimuste genereerimine | Valmis | `aiService.js`, `prompts/question-generation.md` |
| Miljonimängu mängimine | Valmis | `routes/game.js`, `public/js/game.js` |
| Õlekõrte kasutamine | Valmis | Vihje, 50:50 ja publikuhääletus |
| Uue ülesande lisamine | Valmis | `input/XXX/assignment.md` struktuur |
| Selgituse nägemine pärast vastamist | Osaliselt valmis | Selgitus on andmemudelis olemas, UI kuvamine vajab järgmises iteratsioonis täiendust |
| Tulemuste salvestamine | Tegemata | Jäi backlogi, vajab andmebaasi |
| Kasutajate süsteem | Tegemata | Jäi backlogi, ei olnud MVP osa |
| Õpetaja vaade | Tegemata | Jäi backlogi, sõltub tulemuste salvestamisest |

---

## Kasutajalood ja Nõuded

### 1. Kasutajana tahan näha ülesannete nimekirja
**Prioriteet**: KÕRGE  
**Story Points**: 5  
**Sprint**: 1

**Kirjeldus**:
Kasutajana tahan avamal lehel näha kõiki saadaolevaid ülesandeid, et saaksin valida, millise vastu mängida.

**Vastuvõtutingimused**:
- [ ] Rakendus loeb `input/` kaustas olevad numbrilised alamkaustad
- [ ] Iga ülesande jaoks kuvatakse ID ja pealkiri
- [ ] Pealkiri loetakse `assignment.md` esimesest h1 pealkirjast
- [ ] Ülesanded on järjestatud ID järgi
- [ ] Ülesanded on kuvatavad kaardide kujul
- [ ] Ülesannet on võimalik valida

**Nõuded**:
- Kasutajaliides on intuitiivne
- Lehekülje laadimisaeg on < 2 sekundit

---

### 2. Kasutajana tahan valida ülesande
**Prioriteet**: KÕRGE  
**Story Points**: 3  
**Sprint**: 1

**Kirjeldus**:
Pärast ülesande valimist tahan näha ülesande kirjeldust ja nõudeid.

**Vastuvõtutingimused**:
- [ ] Ülesande detailidseade kuvatakse uuel lehel
- [ ] Nägun kuvatakse `assignment.md` sisu
- [ ] Markdown kood teisendatakse HTML-iks
- [ ] Kasutajal on võimalik minna tagasi ülesannete nimekirja
- [ ] Kasutajal on võimalik alustada mängu

---

### 3. Kasutajana tahan, et AI genereerib küsimusi
**Prioriteet**: KÕRGE  
**Story Points**: 8  
**Sprint**: 2

**Kirjeldus**:
Pärast ülesande valimist peab rakendus OpenAI abil genereerima 15 valikvastustega küsimust, mis kontrollivad minu arusaamist.

**Vastuvõtutingimused**:
- [ ] Rakendus saadab `assignment.md` ja lahenduse failid OpenAI API-le
- [ ] OpenAI genereerib 15 küsimust JSON formaadis
- [ ] Küsimused jaotatakse raskusastmete järgi (1-5 kerge, 6-10 keskmine, 11-15 raske)
- [ ] Igal küsimusel on 4 vastusevarianti
- [ ] Küsimused salvestatakse cache'sse
- [ ] Küsimuste genereerimine võtab < 30 sekundit
- [ ] Kasutaja näeb laadimise näitajat

**Nõuded**:
- OpenAI API võti on seadistatud `.env` failis
- Küsimused on sisukad, mitte triviaalsed
- Küsimused kontrollivad arusaamist, mitte mälu

---

### 4. Kasutajana tahan mängida miljonimängu
**Prioriteet**: KÕRGE  
**Story Points**: 13  
**Sprint**: 2-3

**Kirjeldus**:
Mängus esitatakse mulle järjest 15 küsimust. Õige vastuse korral saan edasi liikuda, vale vastuse korral mäng lõpeb.

**Vastuvõtutingimused**:
- [ ] Mängus on 15 küsimust
- [ ] Igal küsimusel on 4 vastusevarianti
- [ ] Vale vastus lõpetab mängu
- [ ] Õige vastus liigutab järgmise küsimuse juurde
- [ ] Kuvatan hetkeseisu ja turvatasemeid
- [ ] Kasutajal on võimalik mängu keskel lõpetada
- [ ] Tulemused kuvatakse pärast mängu lõppu

**Nõuded**:
- Mängu UI on selge ja mugav
- Kasutaja tundub millisele tasemele ta on jõudnud
- Punkte/rahalist summasse kuvatakse

---

### 5. Kasutajana tahan kasutada õlekõrri
**Prioriteet**: KÕRGE  
**Story Points**: 8  
**Sprint**: 3

**Kirjeldus**:
Mängu ajal saan ma kasutada kolme tüüpi õlekõrred: 50:50, AI vihjet ja publikuhääletust.

**Vastuvõtutingimused - 50:50**:
- [ ] Nupp "50:50" on saadaval
- [ ] Klõpsamine eemaldab 2 valet vastusevarianti
- [ ] Õlekõrt saab kasutada ainult ühe korra
- [ ] Kulatakse on kuvatav kui õlekõrt on kasutatud

**Vastuvõtutingimused - AI vihje**:
- [ ] Nupp "Vihje" on saadaval
- [ ] Vihjet küsides saab AI-lt lühikese nõuande
- [ ] Vihje ei ütle otsest vastust
- [ ] Vihjet saab kasutada ainult ühe korra

**Vastuvõtutingimused - Publiku hääletus**:
- [ ] Nupp "Publiku hääletus" on saadaval
- [ ] Klõpsamine näitab simuleeritud publikuhääletuse tulemust
- [ ] Õigele vastusele on suurem tõenäosus saada rohkem hääli
- [ ] Õlekõrt saab kasutada ainult ühe korra

---

### 6. Õpetajana tahan lisada uusi ülesandeid
**Prioriteet**: KÕRGE  
**Story Points**: 3  
**Sprint**: 1

**Kirjeldus**:
Uue ülesande lisamiseks pean vaid looma `input/` kausta uue alamkausta ja lisama `assignment.md` faili ning lahenduse.

**Vastuvõtutingimused**:
- [ ] Rakendus automaatselt avastab uued ülesanded `input/` kaustas
- [ ] Alamkaus peab olema numbriline (001, 002, jne)
- [ ] `assignment.md` fail on kohustuslik
- [ ] Lahenduse failid loetakse automaatselt
- [ ] Ei ole vaja rakendust taaskäivitada

---

### 7. Kasutajana tahan näha selgitust pärast vastamist
**Prioriteet**: KESKMINE  
**Story Points**: 3  
**Sprint**: 3

**Kirjeldus**:
Pärast vastamist tahan näha, kas vastus oli õige, ja teada lühikest selgitust.

**Vastuvõtutingimused**:
- [ ] Vale vastuse korral kuvatakse veateade
- [ ] Õige vastuse korral kuvatakse tunnustus
- [ ] Kuvatakse AI-ga genereeritud selgitus
- [ ] Kasutaja saab liikuda järgmise küsimuse juurde

---

## Lisa Funktsioonid (Parandused)

### 8. Tulemuste salvestamine
**Prioriteet**: MADAL  
**Story Points**: 5  
**Sprint**: 4

- Kasutaja tulemused salvestatakse (nime järgi või anonüümselt)
- Kasutaja saab näha oma ajalugu
- Õpetaja saab näha klassist statistikat

### 9. Kasutajate süsteem
**Prioriteet**: MADAL  
**Story Points**: 8  
**Sprint**: 4-5

- Kasutajad saavad registreeruda
- Kasutajad saavad sisse logida
- Tulemused on seotud kasutajaga

### 10. Õpetaja vaade
**Prioriteet**: MADAL  
**Story Points**: 13  
**Sprint**: 5-6

- Õpetaja saab näha klassist tulemuste statistikat
- Õpetaja saab analüüsida, milliste küsimustega on raskusi
- Õpetaja saab hallata ülesandeid

### 11. Küsimuste regenereerimine
**Prioriteet**: MADAL  
**Story Points**: 2  
**Sprint**: 3

- Kasutajal on võimalik regenereerida küsimusi (uued küsimused)
- Cache'i on võimalik kustutada

---

## Prioriteetide Legend
- **KÕRGE**: Miinimumnõueteks, tuleb teha
- **KESKMINE**: Soovituslik, parandab kogemust
- **MADAL**: Lisa funktsioonid parema hinde jaoks

---

## Sprint Plaani
- **Sprint 1**: Ülesannete nimekirja ja valimise funktionaalsus
- **Sprint 2**: AI küsimuste genereerimine
- **Sprint 3**: Mänguloogika ja õlekõrred
- **Sprint 4**: Tulemuste salvestamine
- **Sprint 5**: Kasutajate süsteem

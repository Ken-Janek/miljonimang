# Miljonimäng - Assignment Validation Game

## Projekti kirjeldus

Miljonimäng on veebirakendus, mis aitab õppijatel kontrollida, kas nad saavad aru enda või kellegi teise lahendusest. Rakendus töötab miljonimängu põhimõttel: kasutajale esitatakse järjest valikvastustega küsimusi, mis genereeritakse AI abil konkreetse ülesande kirjelduse ja lahenduse põhjal.

Erinevalt tavalistest testidest kontrollib Miljonimäng mitte lihtsalt seda, kas failid on olemas või kood töötab, vaid püüab hinnata, kas kasutaja mõistab lahenduses kasutatud kontseptsioone, loogikat ja lähteülesande nõudeid.

## Kasutatud tehnoloogiad

- **Backend**: Node.js + Express (Railway deployment)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI**: OpenAI API (GPT-4/GPT-3.5)
- **Andmehaldus**: JSON failid, faalisüsteem

## Rakenduse Kasutamine

Rakendus on juba juurutatud Railway platvormile ja on kättesaadav aadressil:

**https://miljonimang-production.up.railway.app/**

### Uute Ülesannete Lisamine

Uute ülesannete lisamiseks:

1. Looge uus kaust `input/XXX/` (kus XXX on järgmine number)
2. Lisage `assignment.md` fail ülesande kirjeldusega
3. Lisage lahendusfailid (HTML, CSS, JS)
4. Pushige muudatused GitHubi - Railway deployb automaatselt

### AI Küsimuste Generatsioon

Kõik küsimused genereeritakse OpenAI API abil reaalajas. Iga mängu jaoks luuakse uued küsimused ülesande kirjelduse ja lahenduse põhjal.

5. **Ava brauseris**
   Navigeeri aadressile `http://localhost:3000`

## Input-kausta struktuur

Ülesanded asuvad `input/` kaustas numbriliste alamkaustadena:

```
input/
  001/
    assignment.md
    [lahenduse failid ja kaustad]
  002/
    assignment.md
    [lahenduse failid ja kaustad]
  003/
    assignment.md
    [lahenduse failid ja kaustad]
```

### Miinimumnõuded ülesande jaoks

Iga ülesande kaustale:
- **Kohustuslik**: `assignment.md` - ülesande püstitus, nõuded ja hindamiskriteeriumid
- **Soovituslik**: Lahenduse failid (HTML, CSS, JS, Python, jne) - mida rohkem, seda paremad küsimused

Näide `assignment.md` failist:

```markdown
# JavaScripti Kalkulaator

## Ülesande kirjeldus
Loo lihtne kalkulaator, mis suudab liita, lahutada, korrutada ja jagada kahe arvu.

## Nõuded
1. Kasutajaliides peab olema HTML-failist
2. Arvutused peavad toimuma JavaScriptis
3. Tulemust peab kuvatama HTML-ele
4. Peab kontrollima vale sisendi (jagamine nulliga)

## Hindamiskriteeriumid
- Kõik 4 operatsiooni toimivad
- Vale sisendi puhul kuvatakse veateade
- Kood on loetav ja kommenteeritud
```

## AI küsimuste genereerimise loogika

### Protsess

1. **Sisendi ettevalmistamine**
   - assignment.md failist loetakse ülesande kirjeldus
   - Lahenduse failid loetakse ja nende sisu saadab AI-le
   - Loetakse faili tüübid ja nimed

2. **AI kutsumise prompt**
   - Prompt asub failis `prompts/question-generation.md`
   - Säilitab õlekõrred, teeb 15 küsimust
   - Jaotab küsimused raskusastmetega (1–5 kerge, 6–10 keskmine, 11–15 raske)

3. **Küsimuste JSON-vorming**
   ```json
   {
     "level": 1,
     "question": "Küsimuse tekst",
     "options": ["Valik A", "Valik B", "Valik C", "Valik D"],
     "correctIndex": 1,
     "explanation": "Lühike selgitus"
   }
   ```

### Küsimuste tüübid

**Kerged küsimused (1–5)**
- Ülesande eesmärgid
- Põhilised kontseptsioonid
- Kasutatud failid ja tehnoloogiad

**Keskmise raskusega (6–10)**
- Lahenduse sisemine loogika
- Funktsionaalsed nõuded
- Andmete flow

**Rasked küsimused (11–15)**
- Alternatiivsed lahendused
- Vigade leidmine
- Parandusettepanekud

## Mängu reeglid

### Punktisüsteem
- 1. küsimus - 100 punkti
- 2. küsimus - 200 punkti
- (... jne ...)
- 15. küsimus - 1,000,000 punkti

### Turvatasemed
- Küsimus 5: 1,000 punkti
- Küsimus 10: 32,000 punkti
- Küsimus 15: 1,000,000 punkti

Vale vastuse korral langeb tulemus viimasele saavutatud turvatasemele.

### Õlekõrred
Kasutajal on 3 õlekõrt:
1. **50:50** - Eemaldab 2 valet vastusevarianti
2. **Vihje AI-lt** - AI annab lühikese vihje
3. **Küsi publikult** - Simuleeritud publikuhääletuse tulemused

## Projekti struktuuri kirjeldus

```
Miljonimang/
├── src/
│   ├── server.js              # Express rakenduse sisenemine
│   ├── routes/
│   │   ├── assignments.js     # Ülesannete nimekirja logi
│   │   ├── game.js            # Mängu loogika
│   │   └── ai.js              # AI kütsumised
│   ├── services/
│   │   ├── assignmentService.js
│   │   ├── aiService.js       # OpenAI API kutse
│   │   └── gameService.js
│   └── public/
│       ├── index.html
│       ├── game.html
│       ├── css/
│       │   └── style.css
│       └── js/
│           ├── app.js
│           └── game.js
├── input/
│   └── 001/
│       ├── assignment.md
│       └── [lahenduse failid]
├── prompts/
│   ├── question-generation.md
│   └── hint-generation.md
├── .env                       # Keskkonnavalikud (pole Git'is)
├── .gitignore
├── README.md
└── package.json
```

## Teadaolevad piirangud

- OpenAI API kasutamine nõuab makselist kuulutamist
- Küsimuste genereerimine võtab aega (10-30 sekundit)
- Suurte lahenduste failide puhul võib AI vastus olla ebatäpne
- Praegu ei ole tulemuste püsivat salvestamist

## Edasiarenduse võimalused

### Lühiajalist
- Tulemuste salvestamine andmebaasi
- Kasutajate süsteem
- Küsimuste cache'imine

### Pikaajaline
- Õpetaja vaade statistikaga
- Automaatne hindamine
- Integratsiooni teiste LMS-iga (Moodle, Canvas)
- Mängitavate sessiooni ajalugu
- Edasijõudnud õlekõrred
- Visualiseeritud tulemused

---

**Versioon**: 1.0.0  
**Viimati värskendatud**: mai 2026

# AI Küsimuste Genereerimise Prompt

## Eesmärk
Genereerida 15 valikvastustega küsimust, mis kontrollida õppija arusaamist konkreetsest kodeerimisülesandest ja selle lahendusest.

## Kontekst
Õppijale esitatakse ülesannet ja tema lahendust. Küsimused peavad kontrollima, kas õppija mõistab lahenduse loogikat, kasutatud kontseptsioone ja ülesande nõudeid - mitte ainult seda, kas ta meeles on mõni detaili.

## Küsimuste nõuded

1. **Raskusaste jaotus**
   - Küsimused 1-5: Lihtsad (põhikontseptsioonid)
   - Küsimused 6-10: Keskmise raskusega (sisemine loogika)
   - Küsimused 11-15: Rasked (sügav arusaamine, vigade leidmine)

2. **Igal küsimusel peab olema**
   - Selge, arusaadav küsimus
   - 4 vastusevarianti
   - Täpselt 1 õige vastus
   - Lühike selgitus õige vastuse kohta

3. **Vastusevariandi nõuded**
   - Jällestused peavad olema usutavad, mitte ilmse valeda
   - Valikvariandid peaksid olema üksikul konstrueeritud
   - Mitte kaheldava vastusevariandid

4. **Küsimuste sisu**
   - Põhinevad OTSE assignment.md faili nõuetel ja lahenduse failidel
   - Kontrollivad arusaamist, mitte ainult mälu
   - Viitavad tegeliku koodi, muutujate, funktsioonide nimedele
   - Kuni küsimused võivad käsitleda lahenduse parandamise võimalusi

## Väljundvorming

Tagasta JSON array koos täpselt 15 küsimusega:

```json
[
  {
    "level": 1,
    "question": "Küsimuse tekst",
    "options": ["Valik A", "Valik B", "Valik C", "Valik D"],
    "correctIndex": 0,
    "explanation": "Selgitus, miks see vastus on õige"
  }
]
```

## Näited

### Kerge küsimus (level 1)
```json
{
  "level": 1,
  "question": "Millist HTML-elementi kasutatakse vormi esitamiseks?",
  "options": [
    "<input>",
    "<form>",
    "<button>",
    "<div>"
  ],
  "correctIndex": 1,
  "explanation": "<form> element on HTML-is spetsiaalelt vormi esitamiseks loodud. Kuigi <button> võib kunagi olla vormi osa, on <form> õige vastus."
}
```

### Keskmine küsimus (level 2)
```json
{
  "level": 6,
  "question": "Miks tuleb kasutaja sisend enne arvutamist parseInt() abil teisendada arvuks?",
  "options": [
    "Et kiirendada arvutusi",
    "Kuna HTML input väli tagastab alati teksti, mitte numbrit",
    "Et vähendada mälukasutust",
    "Et tagada brauseriga ühilduvus"
  ],
  "correctIndex": 1,
  "explanation": "HTML input elemendist pärit andmed on alati stringid (tekst). Arvutamise tegemiseks tuleb need arvudeks teisendada, muidu tekib stringi ühendamise asemel numbrite liitmine (nt '5' + '3' = '53')."
}
```

### Raske küsimus (level 11+)
```json
{
  "level": 11,
  "question": "Milline lahenduse osa võib põhjustada turvariski, kui kasutaja sisend lisatakse otse innerHTML abil?",
  "options": [
    "Funktsioon ise on ohtlik",
    "JavaScript ei saa kunagi turvaline olla",
    "Kasutaja sisend võib sisaldada pahatahtlikku koodi (XSS rünne)",
    "See ei ole tegelik probleem"
  ],
  "correctIndex": 2,
  "explanation": "Kui kasutaja sisend lisatakse otse innerHTML abil, saab sisendisse panna pahatahtliku JavaScripti koodi. Turvaline lahendus oleks kasutada textContent või saniteerida sisend."
}
```

## Kohandamine konkreetsele ülesandele

Kui analüüsid ülesannet:
1. Loe assignment.md nõuded hoolikalt
2. Analüüsi lahenduse failid
3. Tuva peamised kontseptsioonid ja võimalikud vigu
4. Genereeri küsimused, mis kontrolliva just neid aspekte
5. Veendu, et õigete vastuste jaotus on erinev (0-3 vahel)

## Küsimuste randomiseerimine

Küsimuste valikvariandid peaksid olema randomiseeritud, et eri mängusessioonidel oleksid nad erineval positsioonil.

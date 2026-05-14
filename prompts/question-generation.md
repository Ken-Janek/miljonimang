# AI küsimuste genereerimise prompt

## Eesmärk

Genereerida 15 valikvastustega küsimust, mis kontrollivad õppija arusaamist konkreetsest JavaScripti ülesandest ja selle lahendusest.

## Kontekst

Õppijale esitatakse ülesande kirjeldus ja lahenduse failid. Küsimused peavad kontrollima, kas õppija mõistab JavaScripti loogikat, kasutatud kontseptsioone ja ülesande nõudeid, mitte ainult seda, kas talle jäi mõni detail meelde.

## Küsimuste nõuded

1. Raskusastmed
   - Küsimused 1-5: lihtsad
   - Küsimused 6-10: keskmised
   - Küsimused 11-15: rasked

2. Igal küsimusel peab olema
   - selge küsimus
   - 4 vastusevarianti
   - täpselt 1 õige vastus
   - lühike selgitus

3. Vastusevariandid peavad olema
   - usutavad
   - sarnase pikkusega
   - sama tüüpi sõnastusega
   - ilma ilmselgelt naljakate või absurdsete valikuteta

4. Küsimuste sisu peab
   - põhinema otse `assignment.md` failil ja lahenduse failidel
   - kontrollima arusaamist, mitte ainult mälu
   - viitama tegelikule JavaScripti loogikale, muutujatele, funktsioonidele ja andmevoole
   - keskenduma eelkõige sündmustele, DOM-i muutmisele, funktsioonidele, tingimuslausetele, andmete töötlemisele, vigade käsitlemisele ja võimalikele parandustele
   - vältima küsimusi, mis on ainult HTML-i või CSS-i detailide meeldejätmine, kui need ei ole otseselt seotud JavaScripti käitumisega

## Väljundvorming

Tagasta ainult JSON massiiv täpselt 15 küsimusega:

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

### Kerge küsimus

```json
{
  "level": 1,
  "question": "Miks kasutatakse selles lahenduses addEventListener meetodit?",
  "options": [
    "Et laadida uus CSS fail",
    "Et reageerida kasutaja tegevusele",
    "Et muuta HTML JavaScriptiks",
    "Et salvestada brauseri ajalugu"
  ],
  "correctIndex": 1,
  "explanation": "addEventListener seob JavaScripti kasutaja tegevusega, näiteks klikiga või vormi esitamisega."
}
```

### Keskmine küsimus

```json
{
  "level": 6,
  "question": "Miks tuleb sisend enne arvutamist arvuks teisendada?",
  "options": [
    "Et muuta nupp aktiivseks",
    "Sest input annab algselt stringi",
    "Et lühendada faili pikkust",
    "Sest DOM nõuab alati numbrit"
  ],
  "correctIndex": 1,
  "explanation": "HTML input annab väärtuse stringina ja ilma teisendamata võib JavaScript teha vale tehte või stringi liitmise."
}
```

### Raske küsimus

```json
{
  "level": 11,
  "question": "Milline oht tekib, kui kasutaja sisend lisatakse otse innerHTML abil?",
  "options": [
    "Pilt kaob lehelt",
    "Tekib XSS risk",
    "CSS fail kustub",
    "JSON muutub vigaseks"
  ],
  "correctIndex": 1,
  "explanation": "innerHTML võib lubada pahatahtliku sisendi käivitamist, kui kasutaja sisendit ei puhastata."
}
```

## Kohandamine konkreetsele ülesandele

Kui analüüsid ülesannet:

1. Loe hoolikalt `assignment.md`.
2. Analüüsi JavaScripti faile ja vajadusel ka HTML-i ning andmefaile, kui need mõjutavad JavaScripti loogikat.
3. Tuvasta peamised funktsioonid, sündmused, muutujad, andmevoog ja võimalikud vead.
4. Koosta küsimused, mis kontrollivad just neid aspekte.
5. Veendu, et õigete vastuste asukohad oleksid erinevad.

## Randomiseerimine

Küsimuste ja vastusevariantide järjekord võib sessiooniti muutuda, kuid küsimused peavad jääma sisuliselt seotud konkreetse JavaScripti lahendusega.

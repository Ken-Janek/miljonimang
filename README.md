Mängi siin: https://miljonimang-production.up.railway.app/

# Miljonimäng

## Projekti kirjeldus

Miljonimäng on veebirakendus, mis aitab kontrollida, kas õppija saab aru enda või kellegi teise tehtud ülesande lahendusest. Rakendus loeb `input/` kaustast ülesande kirjelduse ja lahendusfailid ning genereerib nende põhjal miljonimängu formaadis valikvastustega küsimused.

Rakendus ei kontrolli ainult seda, kas failid eksisteerivad, vaid püüab hinnata, kas kasutaja mõistab lahenduse loogikat, kasutatud kontseptsioone ja lähteülesande nõudeid.

## Kasutatud tehnoloogiad

- Node.js
- Express
- HTML, CSS, JavaScript
- OpenAI API
- `fs-extra` failide lugemiseks

## Käivitamise juhend

### Lokaalselt

1. Paigalda sõltuvused:
   `npm install`
2. Kopeeri `.env.example` failist endale `.env`.
3. Lisa vajadusel `OPENAI_API_KEY`.
4. Käivita rakendus:
   `npm start`
5. Ava brauseris `http://localhost:3000`

### Juurutatud versioon

Rakendus on saadaval ka Railway keskkonnas:

`https://miljonimang-production.up.railway.app/`

## Hindamis- ja projektimaterjalid

- [Product backlog](PRODUCT_BACKLOG.md)
- [Definition of Done](DEFINITION_OF_DONE.md)
- [Testimise dokumentatsioon](TESTING.md)
- [AI küsimuste prompt](prompts/question-generation.md)
- [Projektijuhtimine ja Kanban](docs/PROJECT_MANAGEMENT.md)
- [Lõppdemo, nõuete täitmine ja tagasivaade](docs/FINAL_REVIEW.md)

## Input-kausta struktuur

Rakendus loeb `input/` kaustast kõik numbrilised alamkaustad.

```text
input/
  001/
    assignment.md
    index.html
    style.css
    script.js

  002/
    assignment.md
    app.js
    index.html
    style.css
```

Igas ülesande kaustas peab olema vähemalt:

- `assignment.md`

Samas kaustas või alamkaustades võivad olla lahenduse failid ükskõik millisel kujul.

## AI küsimuste genereerimise loogika

1. Rakendus loeb valitud ülesande `assignment.md` faili.
2. Rakendus loeb sama ülesande kaustast ka lahendusfailid.
3. Need andmed saadetakse OpenAI-le promptiga, mis asub failis [prompts/question-generation.md](prompts/question-generation.md).
4. AI peab tagastama täpselt 15 küsimust JSON-kujul.
5. Igal küsimusel on:
   - `level`
   - `question`
   - `options`
   - `correctIndex`
   - `explanation`

Kui OpenAI API ei ole saadaval, kasutatakse ülesandepõhiseid fallback-küsimusi, et mäng jääks seotuks valitud ülesandega.

## Mängu reeglid

- Mängus on 15 küsimust.
- Igal küsimusel on 4 vastusevarianti.
- Ainult üks vastus on õige.
- Vale vastuse korral mäng lõpeb.
- Kasutaja näeb oma hetkeseisu.
- Kasutaja saab mängu pooleli jätta.
- Küsimused randomiseeritakse iga mängu alguses.

Punktitasemed:

- 1. küsimus: 100
- 2. küsimus: 200
- 3. küsimus: 300
- 4. küsimus: 500
- 5. küsimus: 1 000
- 6. küsimus: 2 000
- 7. küsimus: 4 000
- 8. küsimus: 8 000
- 9. küsimus: 16 000
- 10. küsimus: 32 000
- 11. küsimus: 64 000
- 12. küsimus: 125 000
- 13. küsimus: 250 000
- 14. küsimus: 500 000
- 15. küsimus: 1 000 000

Turvatasemed:

- 5. küsimus: 1 000
- 10. küsimus: 32 000
- 15. küsimus: 1 000 000

Õlekõrred:

- `50:50`
- `Vihje`
- `Publiku hääletus`

## Teadaolevad piirangud

- Küsimuste kvaliteet sõltub OpenAI vastuse kvaliteedist.
- Tulemusi ei salvestata püsivalt andmebaasi.
- Mänguseansse hoitakse serveris mälus.
- Markdowni renderdus on lihtsustatud.

## Edasiarenduse võimalused

- tulemuste salvestamine
- mänguajalugu
- õpetaja vaade
- kasutajate süsteem
- küsimuste cache
- parem markdowni kuvamine
- süntaksivärvimine lahendusfailidele

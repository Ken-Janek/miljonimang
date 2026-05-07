# Arendamise Juhend - Miljonimäng

## Projektis Tööd Alustamine

### 1. Esimesed Sammud

1. **Kloonige või laadige alla projekt**
   ```bash
   git clone <repositorium-url>
   cd Miljonimang
   ```

2. **Installige sõltuvused**
   ```bash
   npm install
   ```

3. **Seadistage .env fail**
   - Kopeerige `.env.example` -> `.env`
   - Lisage oma OpenAI API võti
   ```bash
   cp .env.example .env
   ```

4. **Käivitage rakendus**
   ```bash
   npm start
   ```
   - Või arendamise jaoks: `npm run dev` (nodemon jälgib failide muudatusi)

5. **Avage brauseris**
   ```
   http://localhost:3000
   ```

---

## Projekti Struktuuri Ülevaade

```
Miljonimang/
├── src/
│   ├── server.js                    # Express'i server
│   ├── routes/
│   │   ├── assignments.js          # Ülesannete API
│   │   └── game.js                 # Mängu API
│   ├── services/
│   │   ├── assignmentService.js    # Ülesannete haldamine
│   │   └── aiService.js            # OpenAI ühendus
│   └── public/
│       ├── index.html              # Avaleht
│       ├── game.html               # Mänguleht
│       ├── css/
│       │   └── style.css
│       └── js/
│           ├── app.js              # Avalehe loogika
│           └── game.js             # Mängu loogika
├── input/
│   └── 001/                        # Näidisülesanne
│       ├── assignment.md
│       ├── index.html
│       ├── style.css
│       └── script.js
├── prompts/
│   ├── question-generation.md      # AI prompt
│   └── hint-generation.md
├── cache/                          # Küsimuste cache
├── package.json
├── README.md
├── DEFINITION_OF_DONE.md
├── PRODUCT_BACKLOG.md
├── DEVELOPMENT.md                  # See fail
└── .env.example
```

---

## Uue Ülesande Lisamine

### Samm 1: Looge kaust
```bash
mkdir input/002
```

### Samm 2: Looge assignment.md
```markdown
# Ülesande pealkiri

## Ülesande kirjeldus
...

## Nõuded
...
```

### Samm 3: Lisage lahenduse failid
```
input/002/
├── assignment.md
├── index.html
├── style.css
└── script.js
```

### Samm 4: Testige
- Käivitage rakendus
- Ülesanne peaks automaatselt ilmuma nimekirja

---

## OpenAI API Seadistamine

### 1. API Võtme Hankimine
1. Minge [platform.openai.com](https://platform.openai.com)
2. Logige sisse või registreeruge
3. Avage "API keys" jaotis
4. Klõpsake "Create new secret key"
5. Kopeerige võti

### 2. .env Fail Seadistamine
```env
OPENAI_API_KEY=sk-...
PORT=3000
NODE_ENV=development
OPENAI_MODEL=gpt-3.5-turbo
```

### 3. Kulude Monitorimisega
- OpenAI kutsumised on tasulised
- Kontrollige kasutust [Usage](https://platform.openai.com/account/usage/overview) lehelt
- Määrake kulukulud ära, et vältida üllatavaid arved

---

## Ebaonnenistuste Lahendamine

### "API key not valid"
- Kontrollige `.env` faili
- Veenduge, et võti on õige kopeeeritud
- Võtme algus peaks olema `sk-`

### "Cannot find module"
- Käivitage `npm install`
- Kustutage `node_modules` ja taasinstallige
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port on juba kasutusel
- Muutke PORT`.env` failis
- Või leidke ja peatage käimasolev protsess
```bash
# Windows PowerShellitis
Get-Process node | Stop-Process -Force
```

### Küsimusi ei genereerita
- Kontrollige OpenAI API võtit
- Kontrollige interneti ühendust
- Kontrollige API kasutuse piiranguid
- Vaadake serveri logi (*npm run dev* puhul)

---

## Kodeering ja Koodistiilit

### Konventsioonid
- Muutujad: `camelCase`
- Klassid ja konstruktorid: `PascalCase`
- Konstandid: `UPPER_SNAKE_CASE`
- Failid: `kebab-case`

### JavaScripti Failid
```javascript
/**
 * Lühike kirjeldus
 * @param {type} param - Parameetri kirjeldus
 * @returns {type} Tagastuse väärtuse kirjeldus
 */
function exampleFunction(param) {
    // Kood
}
```

### CSS
- Kasutage CSS-i muutujaid (`--color-primary`)
- Mobile-first lähenemisviis
- Kasutage `rem` suuruste jaoks

---

## Testamine

### Käsitsi Testamine
1. Avage rakendus brauseris
2. Valige ülesanne
3. Alustage mängu
4. Testlige kõiki funktsioone:
   - Vastuste valimist
   - Õlekõrri
   - Mängu lõpetamist

### Erinevate Seadmete Testamine
- Kasutage brauseri "Developer Tools" (F12)
- Testit erinevaid ekraani suurusi
- Testit erinevaid brausereid

---

## Deployment

### Heroku-le Juurutamine (Näide)

1. **Looge Heroku'konto**
2. **Installige Heroku CLI**
3. **Logige sisse**
   ```bash
   heroku login
   ```

4. **Looge rakendus**
   ```bash
   heroku create <app-name>
   ```

5. **Seadistage keskkonnavalikud**
   ```bash
   heroku config:set OPENAI_API_KEY=sk-...
   heroku config:set NODE_ENV=production
   ```

6. **Lükige üles**
   ```bash
   git push heroku main
   ```

---

## Ressursid

- [Express.js dokumentatsioon](https://expressjs.com/)
- [OpenAI dokumentatsioon](https://platform.openai.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Viimane värskendus**: mai 2026

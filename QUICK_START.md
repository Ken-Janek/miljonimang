# 🚀 Kiire Juhend - Miljonimäng

Vaid 5 minutit kestev juhend, kuidas rakendust käivitada.

## Samm 1: Sõltuvuste Installeerimine

```bash
npm install
```

## Samm 2: OpenAI API Võtme Hankimine

1. Minge https://platform.openai.com/api-keys
2. Looge uus "Secret key"
3. Kopeerige võti

## Samm 3: .env Faili Seadistamine

Looge fail `.env` projekti juurkausta ja lisage:

```
OPENAI_API_KEY=sk-YOUR_KEY_HERE
PORT=3000
```

Asendage `YOUR_KEY_HERE` tegeliku API võtmega.

## Samm 4: Rakenduse Käivitamine

```bash
npm start
```

Konsoolisse peaks ilmuma:

```
╔════════════════════════════════════════╗
║   MILJONIMÄNG - Ülesande Valideeri    ║
║                                        ║
║  Server on käivitatud!                ║
║  Ava brauseris: http://localhost:3000  ║
║                                        ║
║  Käsud:                               ║
║  - npm start     (tootmine)           ║
║  - npm run dev   (arendamine)         ║
║                                        ║
╚════════════════════════════════════════╝
```

## Samm 5: Avage Brauseris

Avage aadress: **http://localhost:3000**

---

## Valmis! 🎉

Nüüd peaksite nägema ülesannete nimekirja ja kalkulaatori ülesannet.

---

## Järgmised Sammud

### Uute Ülesannete Lisamine

1. Looge kaust `input/002/`
2. Looge fail `assignment.md` sinna
3. Lisage lahenduse failid (HTML, CSS, JS, Python, jne)
4. Taaslaadigepäid rakendust

### Arendamine

Kasutage `npm run dev` asemel `npm start`, et nodemon jälgiks failide muudatusi:

```bash
npm run dev
```

### Dokumentatsioon

Täpsemad juhised:
- [README.md](README.md) - Projekti kirjeldus
- [DEVELOPMENT.md](DEVELOPMENT.md) - Arendamise juhend
- [TESTING.md](TESTING.md) - Testimise juhend
- [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md) - Kasutajalood

---

## Levinud Probleemid

### "Cannot find module 'express'"
```bash
rm -rf node_modules
npm install
```

### "API key not valid"
- Kontrollige `.env` faili
- Veenduge, et võti on õigesti kopeeritud

### Port 3000 on juba kasutusel
Muutke `.env` failis:
```
PORT=3001
```

---

Juhul, kui teil on küsimusi, vaadake [DEVELOPMENT.md](DEVELOPMENT.md) file täpsemad juhised.

**Happy coding! 🎮**

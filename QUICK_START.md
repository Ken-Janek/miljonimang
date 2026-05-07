# 🚀 Kiire Juhend - Miljonimäng

Rakendus on juba juurutatud Railway platvormile!

## Rakenduse Kasutamine

**Ava brauseris: https://miljonimang-production.up.railway.app/**

### Kuidas Lisada Uusi Ülesandeid

1. **Looge uus kaust** `input/XXX/` (järgmine number)
2. **Lisage failid:**
   - `assignment.md` - ülesande kirjeldus
   - Lahendusfailid (HTML, CSS, JS)
3. **Pushige GitHubi** - Railway deployb automaatselt

### AI Küsimuste Generatsioon

- Küsimused genereeritakse OpenAI API abil
- Iga mängu jaoks uued küsimused
- 15 küsimust järjest raskusastmelt (1-15)
- 4 valikvastust iga küsimuse kohta

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

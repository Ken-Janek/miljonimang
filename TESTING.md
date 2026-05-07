# Testimise Juhend - Miljonimäng

## Testimise Plaani Ülevaade

Selles dokumendis on kirjeldatud, kuidas testida Miljonimängu rakendust ning millal saab öelda, et töö on valmis.

---

## Ühik 1: Ülesannete Avastamine

### Testimise Etapid

1. **Avage rakendus**: http://localhost:3000
2. **Kontrollige, et näide ülesanne kuvatakse**
   - Ülesande ID: 001
   - Pealkiri: "JavaScripti Kalkulaator"
3. **Lisage teine ülesanne**
   - Looge `input/002/assignment.md`
   - Kirjutage sinna mingi ülesande kirjeldus
4. **Taaslaadigegepäid (F5)** - uus ülesanne peaks ilmuma

### Oodatav Käitumine
```
✓ Ülesanded kuvatakse kaardidena
✓ ID ja pealkiri on nähtavad
✓ Ülesanded on järjestatud ID järgi
✓ Kasutaja saab ülesannet klõpsata
```

---

## Ühik 2: Ülesande Valmine

### Testimise Etapid

1. **Klõpsake ülesande kaardile**
2. **Kontrollige ülesande detailseid**
   - Pealkiri kuvatakse
   - Ülesande kirjeldus kuvatakse (markdown konverteeritud)
   - Nupud on nähtavad: "Alusta mängu", "Tagasi"
3. **Klõpsake "Tagasi"** - pöörake naaseb ülesannete nimekirja
4. **Klõpsake "Alusta mängu"** - mäng peaks algama

### Oodatav Käitumine
```
✓ Ülesande detail lehekülg kuvatakse
✓ Markdown kuvatakse HTML-ina
✓ Pealkirjad, nummerdatud loendid, jne formateerivad õigesti
✓ Lingid töötavad hästi
```

---

## Ühik 3: Küsimuste Genereerimine (käsitsi testamine)

**MÄRKUS**: Täielik testamine nõuab OpenAI API võtit.

### Eeltingimused
- `.env` fail seadistatud OpenAI API võtmega
- Interneti ühendus

### Testimise Etapid

1. **Klõpsake "Alusta mängu"**
2. **Oodake laadimisekraani**
   - Spinner peaks rotateerima
   - Tekst: "Laadin küsimusi..."
3. **Kontrollige serverilogi** (*npm run dev* kasutamisel)
   - Peaks olema `[OpenAI] Generating questions...`
4. **Oodake 10-30 sekundit**
5. **Mänguleht peaks ilmuma**

### Oodatav Käitumine
```
✓ Laadimisekraan ilmub
✓ Küsimused genereeritakse (serveris nähtav)
✓ Mänguleht kuvatakse õigesti
✓ Mänguleht näitab Qs 1/15
```

**Kui küsimused ei genereerutu**:
- Kontrollige serveri logi
- Kontrollige OpenAI API võtit
- Kontrollige `.env` faili
- Kontrollige interneti ühendust

---

## Ühik 4: Mängu Toimivus

### Testimise Etapid

1. **Mängulehe kontrollimine**
   - [ ] Küsimuse tekst on nähtav
   - [ ] 4 vastusevarianti on nähtavad (A, B, C, D)
   - [ ] Õlekõrrede nupud on nähtavad (💡 Vihje, 🎯 50:50, 👥 Publik)
   - [ ] Tulemuste redel on paremal pool
   - [ ] Hetkeseisu kuvatakse ülaosas

2. **Vastamise Testimine - Õige Vastus**
   - [ ] Klõpsake õigele vastusele
   - [ ] Vastus märkitakse roheliseks
   - [ ] Teade peaks ilmuma
   - [ ] Järgmine küsimus kuvatatakse
   - [ ] Tulemuste redel värskendatakse

3. **Vastamise Testimine - Vale Vastus**
   - [ ] Klõpsake valele vastusele
   - [ ] Vastus märkitakse punaseks
   - [ ] Õige vastus märkitakse roheliseks
   - [ ] Mäng lõpetub
   - [ ] Tulemuste leht kuvatakse

### Oodatav Käitumine
```
✓ Iga vastuse klõps tööb
✓ Õige/vale vastus märkitakse erinevalt
✓ Küsimused muutuvad järjest
✓ Mängu state uuendatakse õigesti
```

---

## Ühik 5: Õlekõrred

### 50:50 Õlekõrt
1. **Klõpsake 🎯 50:50 nuppu**
2. **Kontrollige, et 2 valet vastust peidetakse**
3. **Nupust peaks olema puudutunud (disabled)**
4. **Korrake - nupp ei peaks töötama**

### Vihje Õlekõrt
1. **Klõpsake 💡 Vihje nuppu**
2. **Vihje kast peaks ilmuma**
3. **Vihje peaks olema asjakohalik ja abilik**
4. **Korrake - nupp ei peaks töötama**

### Publiku Hääletus
1. **Klõpsake 👥 Publik nuppu**
2. **Poll tulemus peaks ilmuma**
3. **Iga valiku protsent peaks olema kuvatud**
4. **Korrake - nupp ei peaks töötama**

---

## Ühik 6: Mängu Lõpp

### 15. Küsimuse Õige Vastus
1. **Mängu ajal jõudke 15. küsimuseni**
2. **Klõpsake õigele vastusele**
3. **Lõppekraan peaks ilmuma**
4. **Sõnum: "Õnnitleksin! Võitsid 1,000,000 €"**
5. **Lõppskoor peaks olema nähtav**

### Mängu Lõpetamine (Quit)
1. **Klõpsake "Lõpeta mäng"**
2. **Kinnitus dialoog peaks ilmuma**
3. **Nõustuge**
4. **Lõppekraan peaks ilmuma**
5. **Tulemused peaksid näitama viimast turva taset**

### Tagasimine
1. **Lõppekraanil klõpsake "Tagasi koju"**
2. **Peaksite olema tagasi avalehel**
3. **Ülesanded on jälle nähtavad**

---

## Sprint 1 Vastutulemused

Pärast Sprint 1 testamist peaks kehtima:

```
Sprint 1 Acceptance Criteria - Avalehe Funktionaalsus
✓ Rakendus käivitub ilma vigadeta
✓ Ülesanded kuvatakse nimekirjas
✓ Iga ülesande juurde kuvatakse ID ja pealkiri
✓ Ülesande valimisel kuvatakse selle details
✓ Ülesande detail lehekülg näitab assignment.md sisu
✓ Markdown teisendatakse HTML-ks
✓ Klõps "Alusta mängu" viib mängulehele
✓ Klõps "Tagasi" viib tagasi nimekirja
✓ Avalehe UI on selge ja kasutajasõbralik
```

---

## Probleemilahendamine Testimise Ajal

### "Cannot GET /api/assignments"
- Kontrollige, et server töötab
- Kontrollige, et input kaust on olemas

### "Ülesanded ei kuva"
- Kontrollige, et `input/001/assignment.md` on olemas
- Kontrollige failide nimed ja kaustad

### "Mänguleht krahh"
- Avage brauseri Developer Tools (F12)
- Vaadake Console jaotist vigade jaoks
- Kontrollige serveri logi

### "Küsimusi ei genereerita"
- Kontrollige OpenAI API võtit
- Kontrollige serveri logi (`npm run dev` puhul)
- Veenduge, et assignment.md on võimalik lugemist

---

## Testimise Kontroll-list

Enne, kui öelda "Sprint valmis":

```
Funktionaalsus
✓ Kõik nõutavad funktsioonid töötavad
✓ Vale sisendi käsitlemine toimib
✓ Veakäsitlus on selge

Kasutajaliides
✓ UI on puhas ja intuitiivne
✓ Tekst on loetav
✓ Nupud on kergesti klõpsatavad
✓ Lehekülje laadimisaeg on vastuvõetav

Eri seadmete testimine
✓ Desktop arvutis on korrektne
✓ Tahvelarvutis on korrektne
✓ Mobiilis on korrektne

Veakäsitlus
✓ Ühenduse puudumisel on teade
✓ OpenAI vea puhul on teade
✓ Failide puudumisel on teade
```

---

**Testimise juhise viimane värskendus**: mai 2026

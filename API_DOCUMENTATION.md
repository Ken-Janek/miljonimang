# API Dokumentatsioon - Miljonimäng

Miljonimängu rakenduse REST API dokumentatsioon.

---

## Base URL

```
http://localhost:3000/api
```

---

## Endpoints

### 1. Ülesannete Nimekirja Saamine

**GET** `/assignments`

Tagastab kõik saadaolevad ülesanded.

**Vastus (200 OK)**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "001",
      "title": "JavaScripti Kalkulaator",
      "path": "/path/to/input/001"
    },
    {
      "id": "002",
      "title": "JSON-andmete Kuvamine",
      "path": "/path/to/input/002"
    }
  ]
}
```

**Näide cURL'iga**
```bash
curl http://localhost:3000/api/assignments
```

---

### 2. Ülesande Detailide Saamine

**GET** `/assignments/:id`

Saab spetsiifilise ülesande kirjelduse ja lahenduse failid.

**Parameetrid**
- `:id` (string) - Ülesande ID (nt "001")

**Vastus (200 OK)**
```json
{
  "success": true,
  "assignment": {
    "id": "001",
    "title": "JavaScripti Kalkulaator",
    "assignment": "# JavaScripti Kalkulaator\n\n## Ülesande kirjeldus\n...",
    "solutionFiles": [
      {
        "path": "index.html",
        "name": "index.html",
        "content": "<!DOCTYPE html>...",
        "extension": "html"
      },
      {
        "path": "style.css",
        "name": "style.css",
        "content": "* { margin: 0; }...",
        "extension": "css"
      },
      {
        "path": "script.js",
        "name": "script.js",
        "content": "function calculate()...",
        "extension": "js"
      }
    ]
  }
}
```

**Tõrge (404 Not Found)**
```json
{
  "success": false,
  "error": "Assignment 999 not found"
}
```

**Näide cURL'iga**
```bash
curl http://localhost:3000/api/assignments/001
```

---

### 3. Mängu Alustamine

**POST** `/game/start`

Alustab uut mängu sessiooni ja genereerib küsimused.

**Request Body**
```json
{
  "assignmentId": "001"
}
```

**Vastus (200 OK)**
```json
{
  "success": true,
  "sessionId": "session_1715000000000_abcd1234",
  "currentQuestion": {
    "index": 0,
    "level": 1,
    "question": "Mis on selle ülesande eesmärk?",
    "options": [
      "Teha kalkulaator",
      "Teha mängu",
      "Teha muusikat",
      "Teha filmi"
    ],
    "totalQuestions": 15
  }
}
```

**Tõrge (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Failed to generate 15 questions"
}
```

**Näide cURL'iga**
```bash
curl -X POST http://localhost:3000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"assignmentId": "001"}'
```

---

### 4. Küsimuse Vastamise Kontroll

**POST** `/game/answer`

Kontrollib kasutaja vastust ja liigutab järgmise küsimuse juurde.

**Request Body**
```json
{
  "sessionId": "session_1715000000000_abcd1234",
  "answerIndex": 0
}
```

**Vastus - Õige Vastus (200 OK)**
```json
{
  "success": true,
  "isCorrect": true,
  "explanation": "JavaScripti kasutatakse kasutaja tegevustele reageerimiseks...",
  "currentScore": 200,
  "nextQuestion": {
    "index": 1,
    "level": 1,
    "question": "Milline faili kasutatakse HTML-i jaoks?",
    "options": [...],
    "totalQuestions": 15
  }
}
```

**Vastus - Vale Vastus (200 OK)**
```json
{
  "success": true,
  "isCorrect": false,
  "explanation": "Vale vastus. JavaScripti kasutatakse reageerimiseks...",
  "correctAnswer": "Kasutaja tegevustele reageerimiseks",
  "gameState": "lost",
  "finalScore": 0,
  "message": "Vale vastus! Saad turvatasemelt 0 punkti."
}
```

**Vastus - Mäng Võidetud (200 OK)**
```json
{
  "success": true,
  "isCorrect": true,
  "explanation": "Õige! See oli viimane küsimus!",
  "gameState": "won",
  "finalScore": 1000000,
  "message": "Õnnitleksin! Võitsid 1,000,000 punkti!"
}
```

**Näide cURL'iga**
```bash
curl -X POST http://localhost:3000/api/game/answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1715000000000_abcd1234",
    "answerIndex": 1
  }'
```

---

### 5. AI Vihje

**POST** `/game/hint`

Saab AI-lt genereeritud vihje praeguse küsimuse jaoks.

**Request Body**
```json
{
  "sessionId": "session_1715000000000_abcd1234"
}
```

**Vastus (200 OK)**
```json
{
  "success": true,
  "hint": "Mõtle sellele, millist meetodit kasutatakse HTML elementide sündmuste kuulamiseks...",
  "hintsRemaining": 0
}
```

**Tõrge - Vihjeõlekõrred Kasutatud (200 OK)**
```json
{
  "success": false,
  "error": "Sa oled juba kasutanud kõik vihjeõlekõrred",
  "hintsUsed": 1
}
```

**Näide cURL'iga**
```bash
curl -X POST http://localhost:3000/api/game/hint \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session_1715000000000_abcd1234"}'
```

---

### 6. 50:50 Õlekõrt

**POST** `/game/50-50`

Eemaldab 2 valet vastusevarianti.

**Request Body**
```json
{
  "sessionId": "session_1715000000000_abcd1234"
}
```

**Vastus (200 OK)**
```json
{
  "success": true,
  "remainingOptions": [
    {
      "index": 1,
      "text": "Kasutaja tegevustele reageerimiseks"
    },
    {
      "index": 3,
      "text": "Serveri korralduse kontrollimiseks"
    }
  ],
  "fiftyFiftyUsed": true
}
```

**Tõrge - Juba Kasutatud (200 OK)**
```json
{
  "success": false,
  "error": "Sa oled juba kasutanud 50:50 õlekõrre"
}
```

**Näide cURL'iga**
```bash
curl -X POST http://localhost:3000/api/game/50-50 \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session_1715000000000_abcd1234"}'
```

---

### 7. Publiku Hääletus

**POST** `/game/audience-poll`

Saab simuleeritud publikuhääletuse tulemused.

**Request Body**
```json
{
  "sessionId": "session_1715000000000_abcd1234"
}
```

**Vastus (200 OK)**
```json
{
  "success": true,
  "poll": {
    "A": 12,
    "B": 68,
    "C": 9,
    "D": 11
  },
  "audiencePollUsed": true
}
```

**Näide cURL'iga**
```bash
curl -X POST http://localhost:3000/api/game/audience-poll \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session_1715000000000_abcd1234"}'
```

---

### 8. Mängu Lõpetamine

**POST** `/game/quit`

Lõpetab praeguse mängu sessiooni.

**Request Body**
```json
{
  "sessionId": "session_1715000000000_abcd1234"
}
```

**Vastus (200 OK)**
```json
{
  "success": true,
  "message": "Mäng lõpetatud",
  "finalScore": 32000
}
```

**Näide cURL'iga**
```bash
curl -X POST http://localhost:3000/api/game/quit \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session_1715000000000_abcd1234"}'
```

---

## Tõrkekoodid

| Kood | Kirjeldus |
|------|-----------|
| 200 | OK - Edukalt |
| 400 | Bad Request - Puuduvad parameetrid |
| 404 | Not Found - Ressursi ei leitud |
| 500 | Server Error - Sisene viga |

---

## Session ID Vorming

```
session_1715000000000_abcd1234

Kus:
- 1715000000000 = Ajahetkemärk (millisekundid)
- abcd1234 = Juhuslaud tekst
```

---

## Mängu Staadiumid

### Game States
- `playing` - Mäng käib
- `won` - Mäng võidetud (15/15 küsimused õigesti)
- `lost` - Mäng kaotatud (vale vastus)

---

## Punktisüsteem

| Küsimus | Punktid | Turvalisel Tase |
|---------|---------|-----------------|
| 1 | 100 | Ei |
| 2 | 200 | Ei |
| 3 | 300 | Ei |
| 4 | 500 | Ei |
| 5 | 1,000 | **Jah** |
| 6 | 2,000 | Ei |
| 7 | 4,000 | Ei |
| 8 | 8,000 | Ei |
| 9 | 16,000 | Ei |
| 10 | 32,000 | **Jah** |
| 11 | 64,000 | Ei |
| 12 | 125,000 | Ei |
| 13 | 250,000 | Ei |
| 14 | 500,000 | Ei |
| 15 | 1,000,000 | **Jah** |

Vale vastuse korral langeb tulemus viimase turva tasemele.

---

## Näide Tervest Mängu Vool

### 1. Alusta mängu
```bash
POST /api/game/start
→ sessionId, firstQuestion
```

### 2. Vasta küsimusele
```bash
POST /api/game/answer (answerIndex: 1)
→ isCorrect: true, nextQuestion
```

### 3. Kasuta õlekõrt (valikuline)
```bash
POST /api/game/hint
→ hint tekst
```

### 4. Vasta teisele küsimusele
```bash
POST /api/game/answer (answerIndex: 2)
→ isCorrect: false, gameState: "lost"
```

### 5. Tulemus
```
Mäng lõpetatud
Score: 1000 (viimane turvalisel tase)
```

---

## Error Handling Kliendis

```javascript
fetch('/api/assignments/001')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Edukalt
      console.log(data.assignment);
    } else {
      // Viga
      console.error(data.error);
    }
  })
  .catch(err => {
    // Ühenduse viga
    console.error('API error:', err);
  });
```

---

## Rate Limiting

Praegu pole rate limiting'ut. Produktsioon keskkonnale soovituslik lisada:
- 100 kutsed / minut per IP
- 10000 API kutsed päevas

---

## Tulevased Laiendused

- [ ] Kasutajate autentimine (JWT)
- [ ] Tulemuste salvestamine (andmebaas)
- [ ] Statistika endpoints
- [ ] Admin endpoints ülesannete haldamiseks
- [ ] WebSockets mitmele kasutajale

---

**API versioon**: 1.0  
**Viimane värskendus**: mai 2026

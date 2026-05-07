const { OpenAI } = require('openai');
const fs = require('fs-extra');
const path = require('path');

// Initialize OpenAI only if API key is provided
const client = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const CACHE_DIR = path.join(__dirname, '..', '..', 'cache');

/**
 * Shuffle array randomly
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomize questions and their options
 */
function randomizeQuestions(questions) {
  // Shuffle the questions themselves
  const shuffledQuestions = shuffleArray(questions).slice(0, 15); // Ensure exactly 15 questions
  
  // Shuffle options within each question and update correctIndex
  return shuffledQuestions.map((question, index) => {
    const optionsWithIndex = question.options.map((option, idx) => ({
      text: option,
      originalIndex: idx
    }));
    
    // Shuffle the options
    const shuffledOptions = shuffleArray(optionsWithIndex);
    
    // Find the new index of the correct answer
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.originalIndex === question.correctIndex);
    
    return {
      ...question,
      index: index,
      options: shuffledOptions.map(opt => opt.text),
      correctIndex: newCorrectIndex
    };
  });
}

/**
 * Generate questions for an assignment
 */
async function generateQuestions(assignment, solutionFiles) {
  try {
    // First, check if questions.json exists in assignment folder
    const questionsJsonPath = path.join(__dirname, '..', '..', 'input', assignment.id, 'questions.json');
    if (fs.existsSync(questionsJsonPath)) {
      console.log(`[Loaded] Using questions.json for ${assignment.id}`);
      const questionsData = await fs.readJson(questionsJsonPath);
      // Randomize the questions each time
      return randomizeQuestions(questionsData);
    }

    // Skip cache - always generate fresh questions
    console.log(`[AI Generation] Generating fresh questions for ${assignment.id}...`);
    if (!client) {
      console.log(`[Mock Mode] Generating mock questions for ${assignment.id}...`);
      const mockQuestions = generateMockQuestions(assignment.title);
      // Randomize the questions each time (no caching)
      return randomizeQuestions(mockQuestions);
    }

    console.log(`[OpenAI] Generating questions for assignment ${assignment.id}...`);

    const prompt = buildQuestionPrompt(assignment, solutionFiles);

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = response.choices[0]?.message?.content || '';
    const questions = parseQuestionsFromResponse(responseText);

    // Randomize the questions each time (no caching)
    return randomizeQuestions(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Build the prompt for question generation
 */
function buildQuestionPrompt(assignment, solutionFiles) {
  let solutionContext = 'LAHENDUSE FAILID:\n\n';

  for (const file of solutionFiles) {
    solutionContext += `\n--- FAIL: ${file.path} ---\n`;
    solutionContext += file.content;
    solutionContext += '\n';
  }

  const prompt = `Sa oled hariduslik AI assistendid. Sinu ülesanne on luua 15 valikvastustega küsimust, mis kontrollida õppija arusaamist ülesandest ja selle lahendusest.

ÜLESANDE KIRJELDUS:
${assignment.assignment}

${solutionContext}

NÕUDED:
1. Genereeri täpselt 15 küsimust
2. Küsimused 1-5 on lihtsad (põhikontseptsioonid)
3. Küsimused 6-10 on keskmise raskusega (sisemine loogika)
4. Küsimused 11-15 on rasked (sügav arusaamine, vigade leidmine)
5. Igal küsimusel peab olema 4 vastusevarianti
6. Ainult üks vastus on õige
7. Küsimused peavad kontrolliva arusaamist, mitte ainult mälu
8. Vastusevariandid peavad olema usutavad ja loogiliselt seotud küsimusega
9. KÕIK vastusevariandid peavad olema SAMADE pikkustega (±2 sõna)
10. Õige vastus EI TOHI olla pikem/lühem kui valed vastused
11. Vastusevariandid peavad olema sarnase keerukusastmega
12. EI OLE võimalik õiget vastust ära arvata pikkuse, sõnastuse või emotssiooni järgi
13. Ära kasuta triviaalset või äärmuslikku sõnastust nagu "Ainult ...", "Kunagi ...", "Kõik ...", "Pole vaja" või "Kõik need peale ühte"
14. Iga vale vastus peab olema tegelikult plausible vigane lahendus või vale arusaam teemast
15. Kui sa ei suuda koostada 4 usutavat vastusevarianti, muuda küsimust nii, et kõigil vastustel oleks tasaväärne loogika

VÄLJUNDVORMING:
Tagasta AINULT JSON array, ilma selgitavate tekstideta:

[
  {
    "level": 1,
    "question": "Küsimuse tekst",
    "options": ["Valik A", "Valik B", "Valik C", "Valik D"],
    "correctIndex": 0,
    "explanation": "Lühike selgitus"
  }
]

TÄHTIS: Tagasta AINULT JSON, mitte midagi muud!`;

  return prompt;
}

/**
 * Generate mock questions for testing (when API key is not available)
 */
function generateMockQuestions(assignmentTitle) {
  const mockQuestions = [
    // Level 1-5: Lihtne - Põhikontseptsioonid
    { level: 1, question: "Millised operatsioonid peab kalkulaator toetama?", options: ["Ainult liitmine", "Liitmine, lahutamine, korrutamine, jagamine", "Ainult korrutamine", "Ruutjuur ja astendamine"], correctIndex: 1, explanation: "Ülesande nõudmiste järgi peab kalkulaator toetama 4 põhioperatsiooni." },
    
    { level: 1, question: "Mis on ülesande eesmärk?", options: ["Muusika esitus", "Lihtne kalkulaator veebirakendus", "Foto redigeerimine", "Video streaming"], correctIndex: 1, explanation: "JavaScripti Kalkulaatori ülesande eesmärk on luua lihtne veebirakendus, mis teostab põhilisi matemaatilisi tehted." },
    
    { level: 2, question: "Kuidas peaks kalkulaator reageerima jagamisele nulliga?", options: ["Näitab juhuslikku numbrit", "Kutsub välja veateate", "Jätab ignoreerida", "Kuvab lõpmatus"], correctIndex: 1, explanation: "Nulliga jagamine peab olema kontrollitud ja veateadet peab kuvama." },
    
    { level: 2, question: "Millisest failist peaks koosistuma kalkulaatori lahendus?", options: ["Ainult HTML", "Ainult JavaScript", "HTML, CSS ja JavaScript", "Ainult CSS"], correctIndex: 2, explanation: "Lahendus peab sisaldama HTML vormile, CSS kujundusele ja JavaScript funktionaalsusele." },
    
    { level: 3, question: "Kuidas peaks kasutaja kalkulaatoriga suhtlema?", options: ["Käsureainterfeis", "Graafiline kasutajaliides arvude ja nuppudega", "Hääle abil", "Hiire liigutusega"], correctIndex: 1, explanation: "Kalkulaatoril peab olema HTML vorm kahe arvusisendi väljaga ja operatsioonide nupud." },
    
    // Level 6-10: Keskmise raskusega - Sisemine loogika
    { level: 6, question: "Mis on event listeneri roll kalkulaatori lahenduses?", options: ["Dekoratsioon ainult", "Kasutaja klikkide ja sisendi jälgimine", "Põhivärvuse määramine", "Teksti suuruse muutmine"], correctIndex: 1, explanation: "Event listenerid on vajalikud kasutaja sisendi ja nuppude klikkide jälgimiseks." },
    
    { level: 6, question: "Kuidas peaks kalkulaator vale sisendi käsitsema?", options: ["Näitab mustast ekraani", "Kutsub välja veateate", "Jätab ignoreerida", "Peatab töö"], correctIndex: 1, explanation: "Vale sisend (mittearv) peab kutsuma välja veateate." },
    
    { level: 7, question: "Millises HTML elemendis peaks tulemust kuvatama?", options: ["<button>", "<input> väli", "<img>", "<audio>"], correctIndex: 1, explanation: "Tulemust peaks kuvatama HTML <input> väljal või väljundväljal." },
    
    { level: 8, question: "Kuidas eristada korrektset kasutajaliidesed projektis?", options: ["Tavade järgimine", "Kommentaarid ja struktureeritus", "Rohkem koodi", "Vähem koodi"], correctIndex: 1, explanation: "Kood peab olema loetav, hästi struktureeritud ja kommenteeritud." },
    
    { level: 9, question: "Millised testid on kriitilised kalkulaatori valideerimiseks?", options: ["Ainult positiivsete arvude test", "Kõik 4 operatsiooni, nulliga jagamine, vale sisend", "Üksnes liitmise test", "Värvide test"], correctIndex: 1, explanation: "Peab testima: kõiki 4 operatsiooni, nulliga jagamise kontrollimist, vale sisendi käsitlemist." },
    
    // Level 11-15: Raske - Sügav arusaamine ja vigade leidmine
    { level: 11, question: "Millises olukorda võib kalkulaator andmeid kaotada?", options: ["Kunagi ei kaota", "Külalisele nupp vajutamise korral peale kustutamise", "Ainult väga külma ilmaga", "Kui kasutaja hiire ühendus lahti läheb"], correctIndex: 1, explanation: "Kustutamise nuppu vajutades tuleb andmed nullida, et vältida eksimusi." },
    
    { level: 11, question: "Kuidas peaks lahendus käituma väga suurte arvudega?", options: ["Näitab viga", "Töötab korrektselt erinevate suuruste arvudega", "Muutub aeglaseks", "Kuvab mustast"], correctIndex: 1, explanation: "Hea lahendus peaks käituma korrektselt erinevate suuruste arvudega." },
    
    { level: 12, question: "Kuidas testida kutsega funktioone JavaScript kalkulaatoris?", options: ["Ära testi", "Kasutaja sisendit simuleerimisega", "Juhuslikult", "Soovitusega"], correctIndex: 1, explanation: "Sisendi ja operatsioone tuleb testida erinevate väärtustega." },
    
    { level: 13, question: "Millised negatiivsete numbrite omadused peab kalkulaator toetama?", options: ["Pole vaja", "Liitmine, lahutamine, korrutamine, jagamine negatiivsete arvudega", "Ainult liitmine", "Ainult lahutamine"], correctIndex: 1, explanation: "Hea lahendus peab toetama negatiivseid numbreid kõigi operatsioonide jaoks." },
    
    { level: 14, question: "Kuidas lahendus peaks käituma kümnendkohadega?", options: ["Ei toeta kümnendkohti", "Toetab kümnendkohti kõigis operatsioonides", "Ainult liitmises", "Ainult lahutamises"], correctIndex: 1, explanation: "Täiuslik lahendus toetab kümnendkohti kõigis matemaatilistes operatsioonides." },
    
    { level: 15, question: "Mis on olulisim aspekt kalkulaatori koodi arenduses?", options: ["Ainult kiirus", "Õigsus, loetavus ja vigade käsitlemine", "Ainult kuidas see välja näeb", "Kommentaaride hulk"], correctIndex: 1, explanation: "Hea kood kombineerib õigsust, loetavust, veakäsitlemist ja hallatavust." }
  ];
  
  return mockQuestions;
}

/**
 * Parse questions from AI response
 */
function parseQuestionsFromResponse(responseText) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in response');
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Validate and normalize questions
    return questions.map((q, index) => ({
      level: q.level || Math.min(15, Math.floor(index / 5) + 1),
      question: q.question || '',
      options: q.options || [],
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || ''
    })).slice(0, 15); // Ensure exactly 15 questions
  } catch (error) {
    console.error('Error parsing questions:', error);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Generate a hint for a specific question
 */
async function generateHint(question) {
  try {
    // If no API key, return mock hint
    if (!client) {
      return "Mõtle küsimuse juurde - vastus on üks neist neljast variandist!";
    }

    const prompt = `Kasutaja vastab küsimusele:

"${question.question}"

Variant A: ${question.options[0]}
Variant B: ${question.options[1]}
Variant C: ${question.options[2]}
Variant D: ${question.options[3]}

Anna kasutajale LÜHIKE vihje (1-2 lauset), mis aitab tal õige vastuse leida, kuid ÄRA ütle otsest vastust.`;

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.choices[0]?.message?.content || 'Vihje ei ole saadaval';
  } catch (error) {
    console.error('Error generating hint:', error);
    return 'Vihje ei ole saadaval';
  }
}

/**
 * Generate audience poll result (simulated)
 */
function generateAudiencePoll(question) {
  const options = question.options.map((_, index) => index);
  
  // Shuffle options
  const shuffled = options.sort(() => Math.random() - 0.5);
  
  // Generate percentages that roughly favor correct answer
  let percentages = [0, 0, 0, 0];
  const correctIndex = question.correctIndex;
  
  // Correct answer gets 30-50% for easy questions, 50-70% for hard
  const correctPercent = Math.random() * (20 + question.level * 3) + 30;
  percentages[correctIndex] = Math.floor(correctPercent);
  
  // Distribute remaining percentage
  const remaining = 100 - percentages[correctIndex];
  const perOption = Math.floor(remaining / 3);
  
  for (let i = 0; i < percentages.length; i++) {
    if (i !== correctIndex) {
      percentages[i] = perOption + (Math.random() * 5 - 2);
    }
  }
  
  // Normalize to 100%
  const sum = percentages.reduce((a, b) => a + b, 0);
  percentages = percentages.map(p => Math.round((p / sum) * 100));
  
  return {
    A: percentages[0],
    B: percentages[1],
    C: percentages[2],
    D: percentages[3]
  };
}

/**
 * Cache functions
 */
function generateCacheKey(assignmentId) {
  return `questions_${assignmentId}`;
}

async function getFromCache(key) {
  try {
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    if (await fs.pathExists(cacheFile)) {
      const data = await fs.readJson(cacheFile);
      // Cache expires after 24 hours
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data.questions;
      }
    }
  } catch (error) {
    console.log(`Cache read failed for ${key}:`, error.message);
  }
  return null;
}

async function saveToCache(key, data) {
  try {
    await fs.ensureDir(CACHE_DIR);
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    await fs.writeJson(cacheFile, {
      timestamp: Date.now(),
      questions: data
    }, { spaces: 2 });
  } catch (error) {
    console.log(`Cache save failed for ${key}:`, error.message);
  }
}

module.exports = {
  generateQuestions,
  generateHint,
  generateAudiencePoll
};

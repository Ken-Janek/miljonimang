const { OpenAI } = require('openai');
const fs = require('fs-extra');
const path = require('path');

const openAiKey = process.env.OPENAI_API_KEY;
const trimmedOpenAiKey = openAiKey ? openAiKey.trim() : '';
const invalidOpenAiKey = !trimmedOpenAiKey ||
  trimmedOpenAiKey.includes('your_api_key') ||
  trimmedOpenAiKey.startsWith('sk-your') ||
  trimmedOpenAiKey.startsWith('sk-test');

const client = invalidOpenAiKey ? null : new OpenAI({
  apiKey: trimmedOpenAiKey
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const CACHE_DIR = path.join(__dirname, '..', '..', 'cache');

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomizeQuestions(questions) {
  const shuffledQuestions = shuffleArray(questions).slice(0, 15);

  return shuffledQuestions.map((question, index) => {
    const optionsWithIndex = question.options.map((option, optionIndex) => ({
      text: option,
      originalIndex: optionIndex
    }));

    const shuffledOptions = shuffleArray(optionsWithIndex);
    const newCorrectIndex = shuffledOptions.findIndex((option) => option.originalIndex === question.correctIndex);

    return {
      ...question,
      index,
      options: shuffledOptions.map((option) => option.text),
      correctIndex: newCorrectIndex
    };
  });
}

function countWords(text) {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function hasBalancedOptions(question) {
  if (!question || !Array.isArray(question.options) || question.options.length !== 4) {
    return false;
  }

  const lengths = question.options.map(countWords);
  const correctLength = lengths[question.correctIndex];
  const longestLength = Math.max(...lengths);
  const shortestLength = Math.min(...lengths);
  const wrongLengths = lengths.filter((_, index) => index !== question.correctIndex);
  const longestWrongLength = Math.max(...wrongLengths);
  const shortestWrongLength = Math.min(...wrongLengths);

  return longestLength - shortestLength <= 3 &&
    correctLength <= longestWrongLength + 1 &&
    correctLength >= shortestWrongLength - 1;
}

function validateQuestionSet(questions) {
  if (!Array.isArray(questions) || questions.length < 15) {
    throw new Error('AI returned an invalid question set');
  }

  const obviousQuestions = questions.filter((question) => !hasBalancedOptions(question));
  if (obviousQuestions.length > 2) {
    throw new Error('AI returned answer options with obvious length patterns');
  }
}

function maskAnswerInHint(text, answer) {
  if (!text || !answer) return text;

  const escapedAnswer = String(answer).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escapedAnswer, 'gi'), 'õige variandiga');
}

function generateLocalHint(question) {
  const correctAnswer = question.options[question.correctIndex];
  const explanation = question.explanation || '';
  const questionText = question.question || '';
  const combinedText = `${questionText} ${correctAnswer} ${explanation}`.toLowerCase();

  const hintRules = [
    {
      keywords: ['eventlistener', 'addeventlistener', 'klik', 'sündmus', 'listener'],
      hint: 'Mõtle sellele, kuidas JavaScript saab teada, et kasutaja tegi mingi tegevuse. Otsi varianti, mis seob kasutaja tegevuse koodiga.'
    },
    {
      keywords: ['dom', 'queryselector', 'element', 'innerhtml', 'textcontent'],
      hint: 'Keskendu sellele, kuidas JavaScript leiab elemendi või muudab lehel olevat sisu. Õige vastus puudutab kasutajaliidese muutmist koodi abil.'
    },
    {
      keywords: ['parseint', 'number(', 'sisend', 'string', 'teisenda'],
      hint: 'Mõtle sellele, mis tüüpi andmed tulevad sisendväljast ja miks neist ei pruugi kohe arvutada saada.'
    },
    {
      keywords: ['if', 'else', 'tingimus', 'kontroll', 'valideer'],
      hint: 'Otsi varianti, mis selgitab otsustusloogikat. JavaScript peab enne tegevust kontrollima, kas sisend või olukord on sobiv.'
    },
    {
      keywords: ['async', 'await', 'fetch', 'promise'],
      hint: 'Siin on oluline, et JavaScript ootaks andmete saabumist või tegeleks vastusega alles siis, kui see on käes.'
    },
    {
      keywords: ['error', 'try', 'catch', 'viga'],
      hint: 'Keskendu sellele, kuidas JavaScript peaks kaituma siis, kui koik ei lahe plaaniparaselt.'
    }
  ];

  const matchingRule = hintRules.find((rule) => rule.keywords.some((keyword) => combinedText.includes(keyword)));
  const hint = matchingRule
    ? matchingRule.hint
    : 'Mõtle sellele, milline variant seletab JavaScripti loogikat kõige paremini. Välista vastused, mis räägivad ainult vaate välimusest.';

  return maskAnswerInHint(hint, correctAnswer);
}

async function generateQuestions(assignment, solutionFiles) {
  try {
    const questionsJsonPath = path.join(__dirname, '..', '..', 'input', assignment.id, 'questions.json');
    if (fs.existsSync(questionsJsonPath)) {
      console.log(`[Loaded] Using questions.json for ${assignment.id}`);
      const questionsData = await fs.readJson(questionsJsonPath);
      return randomizeQuestions(questionsData);
    }

    console.log(`[AI Generation] Generating fresh questions for ${assignment.id}...`);

    if (!client) {
      console.log(`[Mock Mode] Generating mock questions for ${assignment.id}...`);
      return randomizeQuestions(generateAssignmentBasedMockQuestions(assignment, solutionFiles));
    }

    const prompt = buildQuestionPrompt(assignment, solutionFiles);

    try {
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
      validateQuestionSet(questions);

      return randomizeQuestions(questions);
    } catch (error) {
      console.warn('[OpenAI] Failed to generate questions, falling back to mock mode:', error.message);
      return randomizeQuestions(generateAssignmentBasedMockQuestions(assignment, solutionFiles));
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

function buildQuestionPrompt(assignment, solutionFiles) {
  let solutionContext = 'LAHENDUSE FAILID:\n\n';

  for (const file of solutionFiles) {
    solutionContext += `\n--- FAIL: ${file.path} ---\n`;
    solutionContext += file.content;
    solutionContext += '\n';
  }

  return `Sa oled hariduslik AI assistent. Sinu ülesanne on luua 15 valikvastustega küsimust, mis kontrollivad õppija arusaamist ülesandest ja selle lahendusest.

ÜLESANDE KIRJELDUS:
${assignment.assignment}

${solutionContext}

NÕUDED:
1. Genereeri täpselt 15 küsimust.
2. Küsimused 1-5 on lihtsad, 6-10 keskmised ja 11-15 rasked.
3. Igal küsimusel peab olema 4 vastusevarianti ja ainult 1 õige vastus.
4. Küsimused peavad kontrollima arusaamist, mitte ainult mälu.
5. Küsimused peavad olema eelkõige JavaScripti kohta.
6. Keskendu sündmustele, funktsioonidele, muutujatele, tingimuslausetele, DOM-i muutmisele, andmete töötlemisele, sisendi valideerimisele, asünkroonsusele ja vigade käsitlemisele.
7. Kui HTML või CSS on kaasatud, kasuta neid ainult siis, kui need on otseselt seotud JavaScripti käitumisega.
8. Väldi küsimusi, mis küsivad ainult faili nime, HTML elemendi nime või kujunduse detaili kohta ilma JavaScripti loogikata.
9. Vastusevariandid peavad olema usutavad ja loogiliselt seotud küsimusega.
10. KÕIK vastusevariandid peavad olema sarnase pikkusega, maksimaalselt 3 sõna erinevusega.
11. Õige vastus ei tohi olla ainus pikk, detailne või tehniliselt täpne variant.
12. Vastusevariandid peavad olema sama vormiga.
13. Õiget vastust ei tohi olla võimalik ära arvata pikkuse, sõnastuse, detailsuse või emotsiooni järgi.
14. Iga vale vastus peab olema usutav vale arusaam või vigane lahendus.
15. Kui sa ei suuda koostada 4 usutavat varianti, muuda küsimust nii, et kõigil vastustel oleks võrdne loogiline tase.

VÄLJUNDVORMING:
Tagasta AINULT JSON array ilma muu tekstita:

[
  {
    "level": 1,
    "question": "Küsimuse tekst",
    "options": ["Valik A", "Valik B", "Valik C", "Valik D"],
    "correctIndex": 0,
    "explanation": "Lühike selgitus"
  }
]

TÄHTIS: küsimused peavad olema JavaScripti kohta. Tagasta AINULT JSON, mitte midagi muud!`;
}

function generateMockQuestions() {
  return [
    { level: 1, question: 'Miks kasutatakse JavaScriptis addEventListener meetodit?', options: ['Et reageerida tegevusele', 'Et muuta faili laiendit', 'Et peita brauser', 'Et kustutada CSS'], correctIndex: 0, explanation: 'addEventListener seob JavaScripti kasutaja tegevusega, näiteks klikiga.' },
    { level: 1, question: 'Mida tagastab input valja value tavaliselt algselt?', options: ['Stringi vaartuse', 'Booleani vaartuse', 'Massiivi vaartuse', 'Objekti vaartuse'], correctIndex: 0, explanation: 'HTML sisendvaljad annavad JavaScripti jaoks vaikimisi stringi.' },
    { level: 2, question: 'Miks kasutatakse querySelector meetodit?', options: ['Et leida DOM element', 'Et sorteerida massiiv', 'Et teha API voti', 'Et tihendada faili'], correctIndex: 0, explanation: 'querySelector aitab JavaScriptil leida lehelt vajaliku elemendi.' },
    { level: 2, question: 'Milleks on kasulik tingimuslause if?', options: ['Et kontrollida olukorda', 'Et kujundada nuppu', 'Et muuta faili nime', 'Et avada uus sakk'], correctIndex: 0, explanation: 'if lubab JavaScriptil teha otsuseid sisendi või oleku põhjal.' },
    { level: 3, question: 'Miks teisendatakse kasutaja sisend Number abil arvuks?', options: ['Et arvutus toimiks korrektselt', 'Et HTML muutuks kiiremaks', 'Et CSS saaks laadida', 'Et server sulguks'], correctIndex: 0, explanation: 'Ilma teisenduseta võib JavaScript teha stringi ühendamist, mitte arvutust.' }
  ];
}

function generateAssignmentBasedMockQuestions(assignment, solutionFiles) {
  const title = assignment.title || `Ülesanne ${assignment.id}`;
  const jsFiles = solutionFiles.filter((file) => file.extension === 'js');
  const primaryJsFile = jsFiles[0]?.name || 'script.js';
  const secondaryJsFile = jsFiles[1]?.name || primaryJsFile;

  return [
    { level: 1, question: `Milline on faili "${primaryJsFile}" kõige tõenäolisem roll selles lahenduses?`, options: ['Rakenduse loogika juhtimine', 'Ainult kujunduse hoidmine', 'Pildifailide salvestamine', 'Serveri paigaldamine'], correctIndex: 0, explanation: 'JavaScripti fail kannab tavaliselt rakenduse käitumisloogikat ja kasutaja tegevuste töötlemist.' },
    { level: 1, question: 'Miks on JavaScript sellise ulesande puhul oluline?', options: ['Et reageerida kasutajale', 'Et muuta GitHubi linki', 'Et asendada markdowni', 'Et peita kausta nimi'], correctIndex: 0, explanation: 'JavaScript juhib tavaliselt kasutaja sisendit, loogikat ja tulemuse kuvamist.' },
    { level: 2, question: `Mida võib JavaScript fail "${secondaryJsFile}" teha, kui kasutaja vajutab nuppu?`, options: ['Käivitada funktsiooni', 'Muuta faili laiendit', 'Kustutada brauseri ajaloo', 'Lukustada klaviatuuri'], correctIndex: 0, explanation: 'Nupu vajutus seotakse JavaScriptis tihti funktsiooniga, mis töötleb tegevuse.' },
    { level: 2, question: 'Miks tuleb kasutaja sisendit enne töötlemist valideerida?', options: ['Et vältida vigast loogikat', 'Et muuta fonti väiksemaks', 'Et peita punktitabelit', 'Et vahetada faviconi'], correctIndex: 0, explanation: 'Valideerimine aitab JavaScriptil vältida vigaseid olukordi ja ootamatuid tulemusi.' },
    { level: 3, question: 'Milline JavaScripti teema on sellises lahenduses kõige olulisem?', options: ['Andmete ja sündmuste töötlus', 'Ainult värvivalik', 'Ainult faili nimi', 'Ainult brauseri logo'], correctIndex: 0, explanation: 'Sellistes ülesannetes on oluline, kuidas JavaScript töötleb tegevusi ja muudab olekut.' },
    { level: 6, question: 'Mida peaks hea JavaScripti keskne küsimus kontrollima?', options: ['Miks funktsioon nii toimib', 'Mis värvi nupp on', 'Mis nimi kaustal on', 'Mis kell fail loodi'], correctIndex: 0, explanation: 'Küsimus peaks kontrollima, kas õppija saab aru JavaScripti loogikast, mitte ainult välimusest.' },
    { level: 6, question: 'Mis on event listeneri peamine eesmärk?', options: ['Siduda tegevus koodiga', 'Muuta HTML CSSiks', 'Saata fail printerisse', 'Vahendada pildi suurust'], correctIndex: 0, explanation: 'Event listener kuulab kasutaja tegevusi ja lubab JavaScriptil neile reageerida.' },
    { level: 7, question: 'Miks on kasulik hoida JavaScripti loogikat funktsioonides?', options: ['Koodi on lihtsam testida', 'Nuppe saab suuremaks teha', 'HTML kaob luhenemisel', 'Pildid muutuvad teravamaks'], correctIndex: 0, explanation: 'Funktsioonidesse jagatud loogika on loetavam, testitavam ja hooldatavam.' },
    { level: 8, question: 'Milline probleem tekib, kui JavaScript muudab DOM-i vales kohas või valel ajal?', options: ['Kasutajaliides võib anda vale tulemuse', 'Node.js kustub arvutist', 'GitHubi repo kaob', 'Brauser vahetab keelt'], correctIndex: 0, explanation: 'Kui DOM-i muudetakse valesti, ei pruugi kasutaja näha õiget seisu või tulemust.' },
    { level: 9, question: 'Miks peaks JavaScriptis vead kinni püüdma või kasutajale näitama?', options: ['Et rakendus käituks selgemalt', 'Et CSS saaks tumedamaks', 'Et faili nimi oleks pikem', 'Et JSON muutuks HTMLiks'], correctIndex: 0, explanation: 'Veakäsitlus aitab vältida segast olukorda ja annab kasutajale arusaadava tagasiside.' },
    { level: 11, question: 'Milline JavaScripti viga võib anda ootamatu tulemuse arvutuses või töötluses?', options: ['Sisend jääb stringiks', 'Taust on liiga hele', 'Failinimi on lühike', 'Pealkiri on rasvane'], correctIndex: 0, explanation: 'Kui sisendit ei teisendata õigesse tüüpi, võib loogika anda vale tulemuse.' },
    { level: 11, question: 'Miks võib innerHTML kasutamine olla ohtlik, kui sisend tuleb kasutajalt?', options: ['See võib tuua XSS riski', 'See eemaldab alati JavaScripti', 'See peatab npm käivituse', 'See muudab CSS JSONiks'], correctIndex: 0, explanation: 'innerHTML võib lubada pahatahtliku sisu sisestamist, kui sisendit ei puhastata.' },
    { level: 12, question: 'Kuidas parandada JavaScripti hooldatavust suuremas lahenduses?', options: ['Jagada loogika väiksemateks funktsioonideks', 'Kirjutada kõik ühele reale', 'Peita kõik muutujad kommentaari', 'Eemaldada kõik tingimused'], correctIndex: 0, explanation: 'Väiksemad vastutusalad ja selged funktsioonid muudavad koodi hooldatavamaks.' },
    { level: 13, question: 'Milline JavaScripti disainivea märk võib viidata halvale struktuurile?', options: ['Üks funktsioon teeb liiga palju', 'Nupul on ümarad nurgad', 'HTML failis on pealkiri', 'Kaustas on kaks faili'], correctIndex: 0, explanation: 'Kui üks funktsioon teeb korraga liiga palju, muutub loogika raskesti jälgitavaks ja testitavaks.' },
    { level: 15, question: `Mis näitaks kõige paremini, et õppija saab faili "${primaryJsFile}" loogikast aru?`, options: ['Ta oskab selgitada miks kood nii töötab', 'Ta mäletab faili nime peast', 'Ta teab CSS muutujate jada', 'Ta oskab repo URLi kirjutada'], correctIndex: 0, explanation: 'Parim arusaamise märk on võime seletada JavaScripti loogikat, mitte ainult detaile meelde jätta.' }
  ];
}

function parseQuestionsFromResponse(responseText) {
  try {
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in response');
    }

    const questions = JSON.parse(jsonMatch[0]);

    return questions.map((question, index) => ({
      level: question.level || Math.min(15, Math.floor(index / 5) + 1),
      question: question.question || '',
      options: question.options || [],
      correctIndex: question.correctIndex ?? 0,
      explanation: question.explanation || ''
    })).slice(0, 15);
  } catch (error) {
    console.error('Error parsing questions:', error);
    throw new Error('Failed to parse AI response');
  }
}

async function generateHint(question) {
  try {
    if (!client) {
      return generateLocalHint(question);
    }

    const prompt = `Kasutaja vastab küsimusele:

"${question.question}"

Variant A: ${question.options[0]}
Variant B: ${question.options[1]}
Variant C: ${question.options[2]}
Variant D: ${question.options[3]}

Anna kasutajale lühike vihje 1-2 lausega, mis aitab tal leida õige JavaScripti loogika, kuid ära ütle otsest vastust.`;

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

function generateAudiencePoll(question) {
  let percentages = [0, 0, 0, 0];
  const correctIndex = question.correctIndex;
  const correctPercent = Math.random() * (20 + question.level * 3) + 30;

  percentages[correctIndex] = Math.floor(correctPercent);

  const remaining = 100 - percentages[correctIndex];
  const perOption = Math.floor(remaining / 3);

  for (let i = 0; i < percentages.length; i++) {
    if (i !== correctIndex) {
      percentages[i] = perOption + (Math.random() * 5 - 2);
    }
  }

  const sum = percentages.reduce((total, value) => total + value, 0);
  percentages = percentages.map((value) => Math.round((value / sum) * 100));

  return {
    A: percentages[0],
    B: percentages[1],
    C: percentages[2],
    D: percentages[3]
  };
}

function generateCacheKey(assignmentId) {
  return `questions_${assignmentId}`;
}

async function getFromCache(key) {
  try {
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    if (await fs.pathExists(cacheFile)) {
      const data = await fs.readJson(cacheFile);
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

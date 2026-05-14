const { OpenAI } = require('openai');
const fs = require('fs-extra');
const path = require('path');

// Initialize OpenAI only if a real API key is provided
const openAiKey = process.env.OPENAI_API_KEY;
const trimmedOpenAiKey = openAiKey ? openAiKey.trim() : '';
const invalidOpenAiKey = !trimmedOpenAiKey || trimmedOpenAiKey.includes('your_api_key') || trimmedOpenAiKey.startsWith('sk-your') || trimmedOpenAiKey.startsWith('sk-test');
const client = invalidOpenAiKey ? null : new OpenAI({
  apiKey: trimmedOpenAiKey
});

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

  const obviousQuestions = questions.filter(question => !hasBalancedOptions(question));
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
      keywords: ['nulliga', 'jagamisel', 'jagamist nulliga'],
      hint: 'Keskendu erijuhtumile, kus tavaline arvutus ei ole lubatud. Hea lahendus annab kasutajale selge tagasiside, mitte juhusliku tulemuse.'
    },
    {
      keywords: ['event listener', 'listenereid', 'klikk', 'tegevuste'],
      hint: 'Mõtle sellele, mis seob kasutaja nupuvajutuse JavaScripti koodiga. Õige mõte on seotud sündmuse kuulamisega, mitte kujundusega.'
    },
    {
      keywords: ['sisend', 'tekstiks', 'väärtuste', 'kontrollida'],
      hint: 'Vaata, kas vastus räägib kasutaja sisendi turvalisest ja korrektsest käsitlemisest. Kalkulaator ei saa usaldada iga sisestatud väärtust otse.'
    },
    {
      keywords: ['failid', 'html', 'css', 'javascript'],
      hint: 'Mõtle veebirakenduse kolmele põhikihile: struktuur, välimus ja käitumine. Õige vastus katab kõik need rollid.'
    },
    {
      keywords: ['kümnend', 'negatiiv', 'arve'],
      hint: 'Mõtle, kas arv on ikkagi kehtiv sisend kalkulaatorile. Õige lahendus peaks käsitlema tavalisi arvutamise juhtumeid, mitte neid ära keelama.'
    },
    {
      keywords: ['testida', 'test'],
      hint: 'Otsi vastust, mis kontrollib päris arvutusloogika riski. Välimuse muutused ei tõesta, et kalkulaator arvutab õigesti.'
    },
    {
      keywords: ['hooldatav', 'kvaliteedi', 'funktsioon', 'loogikat'],
      hint: 'Mõtle arendaja vaatenurgast: hea lahendus on lihtne kontrollida, muuta ja vigade korral parandada.'
    },
    {
      keywords: ['tulemus', 'kuvada'],
      hint: 'Kasutaja peab tulemust nägema otse kasutajaliideses. Õige vastus puudutab nähtavat väljundit, mitte lehe tehnilisi metaandmeid.'
    }
  ];

  const matchingRule = hintRules.find(rule => rule.keywords.some(keyword => combinedText.includes(keyword)));
  const hint = matchingRule ? matchingRule.hint : 'Mõtle, milline variant lahendab küsimuses kirjeldatud tegeliku probleemi. Välista vastused, mis tegelevad ainult välimuse või kõrvalise detailiga.';

  return maskAnswerInHint(hint, correctAnswer);
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
      const mockQuestions = generateAssignmentBasedMockQuestions(assignment, solutionFiles);
      // Randomize the questions each time (no caching)
      return randomizeQuestions(mockQuestions);
    }

    console.log(`[OpenAI] Generating questions for assignment ${assignment.id}...`);

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

      // Randomize the questions each time (no caching)
      return randomizeQuestions(questions);
    } catch (error) {
      console.warn('[OpenAI] Failed to generate questions, falling back to mock mode:', error.message);
      const mockQuestions = generateAssignmentBasedMockQuestions(assignment, solutionFiles);
      return randomizeQuestions(mockQuestions);
    }
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
9. KÕIK vastusevariandid peavad olema sarnase pikkusega (maksimaalselt 3 sõna erinevust)
10. Õige vastus EI TOHI olla ainus pikk, detailne või tehniliselt täpne variant
11. Vastusevariandid peavad olema sama vormiga: kui üks algab tegusõnaga, peavad kõik algama sarnaselt
12. EI OLE võimalik õiget vastust ära arvata pikkuse, sõnastuse, detailsuse või emotsiooni järgi
13. Ära kasuta triviaalset või äärmuslikku sõnastust nagu "Ainult ...", "Kunagi ...", "Kõik ...", "Pole vaja" või "Kõik need peale ühte"
14. Iga vale vastus peab olema usutav vigane lahendus või tüüpiline vale arusaam teemast
15. Vale vastus ei tohi olla naljakas, teemast väljas ega ilmselgelt absurdne
16. Kui sa ei suuda koostada 4 usutavat vastusevarianti, muuda küsimust nii, et kõigil vastustel oleks tasaväärne loogika
17. Enne vastamist kontrolli iga küsimust: õige variant ei tohi olla pikim rohkem kui 1 sõna võrra

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
  return [
    { level: 1, question: "Millist tüüpi rakendus tuleb ülesandes luua?", options: ["Kalkulaatori veebirakendus", "Tekstiredaktori veebirakendus", "Kalendri veebirakendus", "Märkmiku veebirakendus"], correctIndex: 0, explanation: "Ülesanne keskendub kalkulaatori veebirakenduse loomisele." },
    { level: 1, question: "Millised põhitehted peavad olemas olema?", options: ["Liitmine ja lahutamine", "Korrutamine ja jagamine", "Neli põhilist arvutust", "Astmendamine ja juurimine"], correctIndex: 2, explanation: "Kalkulaator peab toetama nelja põhilist aritmeetilist tehet." },
    { level: 2, question: "Mida peaks lahendus tegema nulliga jagamisel?", options: ["Kuvama selge veateate", "Tagastama viimase tulemuse", "Tühjendama kõik väljad", "Kordama eelmist tehet"], correctIndex: 0, explanation: "Nulliga jagamine peab olema eraldi kontrollitud ja kasutajale arusaadavalt kuvatud." },
    { level: 2, question: "Millised failid moodustavad tüüpilise lahenduse?", options: ["HTML, CSS ja JavaScript", "Markdown, JSON ja CSS", "HTML, JSON ja README", "JavaScript, PNG ja HTML"], correctIndex: 0, explanation: "Veebirakendus koosneb tavaliselt struktuurist, kujundusest ja käitumisloogikast." },
    { level: 3, question: "Kuidas kasutaja arvutuse käivitab?", options: ["Valib nupu või tehte", "Muudab brauseri seadeid", "Laeb faili üles", "Avab eraldi konsooli"], correctIndex: 0, explanation: "Kasutaja peaks saama arvutuse käivitada kasutajaliidese kaudu." },
    { level: 6, question: "Milleks kasutatakse event listenereid?", options: ["Kasutaja tegevuste püüdmiseks", "CSS värvide salvestamiseks", "HTML failide pakkimiseks", "Lehe fondi vahetamiseks"], correctIndex: 0, explanation: "Event listenerid seovad kasutaja klikid või sisestused JavaScripti loogikaga." },
    { level: 6, question: "Miks tuleb sisend enne arvutust kontrollida?", options: ["Vigaste väärtuste vältimiseks", "Nuppude suuruse muutmiseks", "Failinimede lühendamiseks", "Taustavärvi valimiseks"], correctIndex: 0, explanation: "Kontroll aitab vältida tühje, valesid või arvuks teisendamatuid sisendeid." },
    { level: 7, question: "Kuhu sobib arvutuse tulemus kuvada?", options: ["Eraldi tulemuse väljale", "Lehe meta kirjeldusse", "CSS klassi nimesse", "Faili laiendi sisse"], correctIndex: 0, explanation: "Tulemus peab olema kasutajaliideses selgelt nähtav." },
    { level: 8, question: "Mis teeb koodi lihtsamini hooldatavaks?", options: ["Selged nimed ja jaotus", "Pikad nimetud funktsioonid", "Korduvad arvutusplokid", "Peidetud kasutajasisend"], correctIndex: 0, explanation: "Loetav struktuur ja selged nimed aitavad lahendust mõista ja parandada." },
    { level: 9, question: "Millist juhtumit tuleks kindlasti testida?", options: ["Jagamist nulliga", "Pealkirja värvimist", "Akna laiuse muutmist", "Lehe ikooni asendust"], correctIndex: 0, explanation: "Nulliga jagamine on kalkulaatori oluline veajuhtum." },
    { level: 11, question: "Mis võib põhjustada vale arvutustulemuse?", options: ["Sisendi jätmine tekstiks", "Nupu värvi muutmine", "Pealkirja keskele panek", "Äärise raadiuse muutus"], correctIndex: 0, explanation: "Kui sisend jääb tekstiks, võib arvutusloogika anda ootamatu tulemuse." },
    { level: 11, question: "Kuidas peaks lahendus käsitlema kümnendmurde?", options: ["Arvutama need korrektselt", "Ümardama enne sisestust", "Keelama kõik komad", "Peitma tulemuse välja"], correctIndex: 0, explanation: "Hea kalkulaator töötab ka kümnendmurdudega, kui ülesanne seda eeldab." },
    { level: 12, question: "Miks on eraldi arvutusfunktsioon kasulik?", options: ["Loogikat saab testida", "CSS muutub lühemaks", "HTML laadib pilte", "Brauser vahetab keelt"], correctIndex: 0, explanation: "Eraldi funktsiooni on lihtsam testida ja taaskasutada." },
    { level: 13, question: "Kuidas peaks negatiivseid arve käsitlema?", options: ["Lubama tavapärase arvutusena", "Muutma need positiivseks", "Kustutama enne arvutust", "Asendama need nulliga"], correctIndex: 0, explanation: "Negatiivsed arvud on tavalised arvväärtused ja peaksid töötama korrektselt." },
    { level: 15, question: "Mis on lahenduse kvaliteedi kõige parem märk?", options: ["Õige tulemus ja veakontroll", "Hele taust ja vari", "Palju ikoone reas", "Väga suur pealkiri"], correctIndex: 0, explanation: "Kõige olulisem on korrektne loogika, selge kasutajasisend ja vigade käsitlemine." }
  ];

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

function generateAssignmentBasedMockQuestions(assignment, solutionFiles) {
  const title = assignment.title || `Ülesanne ${assignment.id}`;
  const fileNames = solutionFiles.map(file => file.name);
  const extensions = [...new Set(solutionFiles.map(file => file.extension).filter(Boolean))];
  const firstFile = fileNames[0] || 'lahendusfail';
  const secondFile = fileNames[1] || firstFile;

  return [
    { level: 1, question: `Mis on ülesande "${title}" peamine eesmärk?`, options: ['Lahenduse mõistmise kontroll', 'Brauseri seadete muutmine', 'Serveri kustutamine', 'Failide peitmine'], correctIndex: 0, explanation: 'Selle rakenduse küsimused peavad kontrollima, kas kasutaja saab ülesande lahendusest aru.' },
    { level: 1, question: 'Milline fail on iga ülesande juures kohustuslik?', options: ['assignment.md', 'results.json', 'server.log', 'notes.txt'], correctIndex: 0, explanation: 'assignment.md sisaldab ülesande kirjeldust, nõudeid ja hindamiskriteeriume.' },
    { level: 2, question: `Miks loetakse lisaks assignment.md failile ka "${firstFile}" sisu?`, options: ['Et näha päris teostust', 'Et muuta faili nime', 'Et peita punktitabel', 'Et asendada README'], correctIndex: 0, explanation: 'Lahendusfailid annavad AI-le vajaliku konteksti küsimuste koostamiseks.' },
    { level: 2, question: `Mida ütleb failide loend ${extensions.join(', ') || 'mitme faili'} kohta kõige paremini?`, options: [inferPrimaryStack(extensions), 'Projektis pole loogikat', 'Projekt on ainult andmebaas', 'Projekt on ainult pildikogu'], correctIndex: 0, explanation: 'Faililaiendid annavad vihje, milliste tehnoloogiatega lahendus on tehtud.' },
    { level: 3, question: `Miks on kasulik, et ülesande failid nagu "${secondFile}" kaasatakse analüüsi?`, options: ['Küsimused saavad olla sisulisemad', 'Punktid muutuvad suuremaks', 'Vastus on alati A', 'Mäng lõpeb kiiremini'], correctIndex: 0, explanation: 'Kui AI näeb ka lahendusfaile, saab ta kontrollida loogikat, mitte ainult kirjeldust.' },
    { level: 6, question: 'Miks ei piisa ainult faili nimede põhjal küsimuste koostamisest?', options: ['See ei näita lahenduse loogikat', 'See muudab CSS aeglaseks', 'See kustutab markdowni', 'See peatab serveri'], correctIndex: 0, explanation: 'Arusaamise kontrollimiseks peab küsimus põhinema päris sisul ja teostusel.' },
    { level: 6, question: 'Mida peaks hea keskmise raskusega küsimus kõige tõenäolisemalt kontrollima?', options: ['Andmevoogu või sisemist loogikat', 'Ainult kausta värvi', 'Ainult faili suurust', 'Ainult commiti kuupäeva'], correctIndex: 0, explanation: 'Keskmise taseme küsimused peavad minema sügavamale kui lihtsalt põhimõistete kordamine.' },
    { level: 7, question: 'Milline risk tekib siis, kui küsimused kontrollivad ainult mälu?', options: ['Vastused saab pähe õppida', 'Server ei käivitu', 'Nupud kaovad', 'HTML muutub JSON-iks'], correctIndex: 0, explanation: 'Sellisel juhul ei saa enam hinnata, kas õppija päriselt saab lahendusest aru.' },
    { level: 8, question: 'Miks on numbriliste alamkaustade kasutamine hea disainivalik?', options: ['Uusi ülesandeid on lihtne lisada', 'Kõik failid muutuvad lühemaks', 'AI-d pole enam vaja', 'Mängus kaob punktiarvestus'], correctIndex: 0, explanation: 'Selline struktuur teeb süsteemi edasiarendatavaks ja skaleeritavaks.' },
    { level: 9, question: 'Millist asja peaks AI küsimuste loomisel kontrollima assignment.md ja koodi võrdluses?', options: ['Kas nõuded on päriselt täidetud', 'Kas failid on tähestikus', 'Kas kasutaja nimi on lühike', 'Kas brauser on täisekraanil'], correctIndex: 0, explanation: 'Oluline on võrrelda lähteülesannet tegeliku teostusega.' },
    { level: 11, question: 'Mis on suurim puudus siis, kui AI näeb ainult assignment.md faili, aga mitte lahendusfaile?', options: ['Küsimused jäävad liiga üldiseks', 'Punktid ei saa väärtust', 'CSS failid kaovad', 'Publikuhääletus peatub'], correctIndex: 0, explanation: 'Ilma lahenduseta ei saa hinnata, kuidas õppija tegelik kood või failistruktuur töötab.' },
    { level: 12, question: 'Kuidas parandada küsimuste kvaliteeti ilma päris API-ta fallback-režiimis?', options: ['Seostada küsimused valitud ülesandega', 'Näidata alati õiget vastust', 'Eemaldada kõik selgitused', 'Küsida ainult failinimesid'], correctIndex: 0, explanation: 'Hea fallback peab jääma sama ülesande konteksti, mitte muutuma juhuslikuks viktoriiniks.' },
    { level: 13, question: 'Milline leid viitaks, et lahendus ei vasta assignment.md nõuetele?', options: ['Nõue ei kajastu teostuses', 'Failinimi on lühike', 'Kaustas on kaks faili', 'README on markdownis'], correctIndex: 0, explanation: 'Nõuete ja lahenduse vahelise vastuolu märkamine näitab sügavamat arusaamist.' },
    { level: 14, question: 'Milline edasiarendus tugevdaks õpetaja vaates kõige rohkem selle rakenduse väärtust?', options: ['Tulemuste ja vigade ajaloo salvestus', 'Kõigi nuppude halliks värvimine', 'Küsimuste arvu vähendamine', 'assignment.md eemaldamine'], correctIndex: 0, explanation: 'Tulemuste ajalugu aitaks õpetajal näha, millised teemad on õppijatele rasked.' },
    { level: 15, question: 'Milline fallback-käitumine toetab kõige paremini projekti algset eesmärki?', options: ['Ülesandepõhised varuküsimused', 'Täiesti juhuslikud küsimused', 'Kohe mängu lõpetamine', 'Tühi vastuseekraan'], correctIndex: 0, explanation: 'Ka varurežiimis peab süsteem kontrollima valitud ülesande mõistmist, mitte suvalisi fakte.' }
  ];
}

function inferPrimaryStack(extensions) {
  if (extensions.includes('html') && extensions.includes('css') && extensions.includes('js')) {
    return 'Veebi struktuur, kujundus ja loogika';
  }
  if (extensions.includes('py')) {
    return 'Pythoni rakendusloogika';
  }
  if (extensions.includes('json') && extensions.includes('js')) {
    return 'Andmefail ja JavaScripti töötlus';
  }
  if (extensions.length > 0) {
    return 'Mitme failiga tehniline lahendus';
  }
  return 'Üldine failipõhine lahendus';
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
    // If no API key, return a local contextual hint
    if (!client) {
      return generateLocalHint(question);
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

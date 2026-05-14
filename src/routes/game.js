const express = require('express');
const assignmentService = require('../services/assignmentService');
const aiService = require('../services/aiService');

const router = express.Router();

// Store game sessions in memory (in production, use a database)
const gameSessions = new Map();

/**
 * POST /api/game/start
 * Start a new game session
 */
router.post('/start', async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'assignmentId is required'
      });
    }

    // Get assignment and solution files
    const assignment = await assignmentService.getAssignment(assignmentId);

    // Generate questions
    const questions = await aiService.generateQuestions(assignment, assignment.solutionFiles);

    if (questions.length < 15) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate 15 questions'
      });
    }

    // Create game session with ALL questions
    const sessionId = generateSessionId();
    const session = {
      sessionId,
      assignmentId,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      safetyLevel: 0,
      hintsUsed: 0,
      fiftyFiftyUsed: false,
      audiencePollUsed: false,
      gameState: 'playing' // playing, won, lost
    };

    gameSessions.set(sessionId, session);

    res.json({
      success: true,
      sessionId,
      questions: questions,  // Send all questions
      currentQuestion: {
        index: 0,
        level: questions[0].level,
        question: questions[0].question,
        options: questions[0].options,
        totalQuestions: 15
      }
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/game/answer
 * Answer a question
 */
router.post('/answer', (req, res) => {
  try {
    const { sessionId, answerIndex } = req.body;

    if (!sessionId || answerIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and answerIndex are required'
      });
    }

    const session = gameSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctIndex;

    // Update score
    if (isCorrect) {
      session.score = getPointsForLevel(session.currentQuestionIndex + 1);
      updateSafetyLevel(session);

      // Check if game is won
      if (session.currentQuestionIndex === 14) {
        session.gameState = 'won';
        return res.json({
          success: true,
          isCorrect: true,
          explanation: currentQuestion.explanation,
          gameState: 'won',
          finalScore: session.score,
          message: `Õnnitleksin! Võitsid 1,000,000 punkti!`
        });
      }

      // Move to next question
      session.currentQuestionIndex++;
      const nextQuestion = session.questions[session.currentQuestionIndex];

      return res.json({
        success: true,
        isCorrect: true,
        explanation: currentQuestion.explanation,
        currentScore: session.score,
        nextQuestion: {
          index: session.currentQuestionIndex,
          level: nextQuestion.level,
          question: nextQuestion.question,
          options: nextQuestion.options,
          totalQuestions: 15
        }
      });
    } else {
      // Wrong answer - game over
      session.gameState = 'lost';
      return res.json({
        success: true,
        isCorrect: false,
        explanation: currentQuestion.explanation,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        gameState: 'lost',
        finalScore: session.safetyLevel,
        message: `Vale vastus! Saad turvatasemelt ${session.safetyLevel} punkti.`
      });
    }
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/state/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = gameSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    return res.json({
      success: true,
      sessionId: session.sessionId,
      assignmentId: session.assignmentId,
      currentQuestionIndex: session.currentQuestionIndex,
      currentScore: session.score,
      safetyLevel: session.safetyLevel,
      hintsUsed: session.hintsUsed,
      fiftyFiftyUsed: session.fiftyFiftyUsed,
      audiencePollUsed: session.audiencePollUsed,
      gameState: session.gameState,
      currentQuestion: {
        index: session.currentQuestionIndex,
        level: currentQuestion.level,
        question: currentQuestion.question,
        options: currentQuestion.options,
        totalQuestions: session.questions.length
      },
      questions: session.questions
    });
  } catch (error) {
    console.error('Error restoring game session:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/game/hint
 * Get a hint
 */
router.post('/hint', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const session = gameSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Game session not found' });
    }

    if (session.hintsUsed >= 1) {
      return res.json({
        success: false,
        error: 'Sa oled juba kasutanud kõik vihjeõlekõrred',
        hintsUsed: session.hintsUsed
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const hint = await aiService.generateHint(currentQuestion);

    session.hintsUsed++;

    res.json({
      success: true,
      hint: hint,
      hintsRemaining: 1 - session.hintsUsed
    });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/game/50-50
 * Use 50:50 lifeline
 */
router.post('/50-50', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const session = gameSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Game session not found' });
    }

    if (session.fiftyFiftyUsed) {
      return res.json({
        success: false,
        error: 'Sa oled juba kasutanud 50:50 õlekõrre'
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const correctIndex = currentQuestion.correctIndex;

    // Select which two to remove
    const indices = [0, 1, 2, 3];
    const wrongIndices = indices.filter(i => i !== correctIndex);
    const toRemove = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);

    const remainingIndices = indices.filter(i => !toRemove.includes(i));

    session.fiftyFiftyUsed = true;

    res.json({
      success: true,
      remainingOptions: remainingIndices.map(i => ({
        index: i,
        text: currentQuestion.options[i]
      })),
      fiftyFiftyUsed: true
    });
  } catch (error) {
    console.error('Error using 50:50:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/game/audience-poll
 * Get audience poll
 */
router.post('/audience-poll', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const session = gameSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Game session not found' });
    }

    if (session.audiencePollUsed) {
      return res.json({
        success: false,
        error: 'Sa oled juba kasutanud publikuhääletuse õlekõrre'
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const poll = aiService.generateAudiencePoll(currentQuestion);

    session.audiencePollUsed = true;

    res.json({
      success: true,
      poll: poll,
      audiencePollUsed: true
    });
  } catch (error) {
    console.error('Error getting audience poll:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/game/quit
 * Quit the game
 */
router.post('/quit', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const session = gameSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Game session not found' });
    }

    const finalScore = session.safetyLevel;
    gameSessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Mäng lõpetatud',
      finalScore: finalScore
    });
  } catch (error) {
    console.error('Error quitting game:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getPointsForLevel(levelNumber) {
  const points = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
  return points[levelNumber - 1] || 0;
}

function updateSafetyLevel(session) {
  const safetyLevels = [0, 0, 0, 0, 0, 1000, 1000, 1000, 1000, 1000, 32000, 32000, 32000, 32000, 32000, 1000000];
  session.safetyLevel = safetyLevels[session.currentQuestionIndex + 1] || 0;
}

module.exports = router;

const express = require('express');
const assignmentService = require('../services/assignmentService');

const router = express.Router();

/**
 * GET /api/assignments
 * Get list of all assignments
 */
router.get('/', async (req, res) => {
  try {
    const assignments = await assignmentService.getAllAssignments();
    res.json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/assignments/:id
 * Get specific assignment
 */
router.get('/:id', async (req, res) => {
  try {
    const assignment = await assignmentService.getAssignment(req.params.id);
    res.json({
      success: true,
      assignment: assignment
    });
  } catch (error) {
    console.error('Error getting assignment:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

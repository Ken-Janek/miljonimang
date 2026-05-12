const fs = require('fs-extra');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', '..', 'input');
const HIDDEN_ASSIGNMENT_IDS = new Set(['002', '003']);

/**
 * Get all assignments from input directory
 */
async function getAllAssignments() {
  try {
    if (!await fs.pathExists(INPUT_DIR)) {
      await fs.ensureDir(INPUT_DIR);
      return [];
    }

    const entries = await fs.readdir(INPUT_DIR, { withFileTypes: true });
    const assignments = [];

    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{3}$/.test(entry.name) && !HIDDEN_ASSIGNMENT_IDS.has(entry.name)) {
        const assignmentPath = path.join(INPUT_DIR, entry.name);
        const assignmentMdPath = path.join(assignmentPath, 'assignment.md');

        if (await fs.pathExists(assignmentMdPath)) {
          const content = await fs.readFile(assignmentMdPath, 'utf-8');
          const title = extractTitle(content) || `Ülesanne ${entry.name}`;

          assignments.push({
            id: entry.name,
            title: title,
            path: assignmentPath
          });
        }
      }
    }

    return assignments.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error('Error reading assignments:', error);
    throw error;
  }
}

/**
 * Extract title from markdown file (first h1 heading)
 */
function extractTitle(content) {
  const match = content.match(/^#\s+(.+?)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Get specific assignment details
 */
async function getAssignment(assignmentId) {
  try {
    const assignmentPath = path.join(INPUT_DIR, assignmentId);

    if (!await fs.pathExists(assignmentPath)) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    const assignmentMdPath = path.join(assignmentPath, 'assignment.md');
    if (!await fs.pathExists(assignmentMdPath)) {
      throw new Error(`assignment.md not found for ${assignmentId}`);
    }

    const assignmentContent = await fs.readFile(assignmentMdPath, 'utf-8');
    const solutionFiles = await getSolutionFiles(assignmentPath);

    return {
      id: assignmentId,
      title: extractTitle(assignmentContent) || `Ülesanne ${assignmentId}`,
      assignment: assignmentContent,
      solutionFiles: solutionFiles
    };
  } catch (error) {
    console.error('Error reading assignment:', error);
    throw error;
  }
}

/**
 * Recursively get all solution files from assignment directory
 */
async function getSolutionFiles(assignmentPath) {
  const solutionFiles = [];
  const ignoredDirs = ['node_modules', '.git', 'venv', '__pycache__', '.venv'];

  async function traverseDir(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(assignmentPath, fullPath);

        // Skip certain directories
        if (entry.isDirectory()) {
          if (!ignoredDirs.includes(entry.name) && !entry.name.startsWith('.')) {
            await traverseDir(fullPath);
          }
        } else {
          // Skip assignment.md and certain files
          if (entry.name !== 'assignment.md' && !entry.name.startsWith('.')) {
            const content = await fs.readFile(fullPath, 'utf-8').catch(() => null);
            if (content) {
              solutionFiles.push({
                path: relativePath,
                name: entry.name,
                content: content,
                extension: path.extname(entry.name).slice(1)
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error traversing directory ${dir}:`, error);
    }
  }

  await traverseDir(assignmentPath);
  return solutionFiles;
}

module.exports = {
  getAllAssignments,
  getAssignment,
  getSolutionFiles
};

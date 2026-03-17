const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', '..', 'data', 'users');

function getUserCharDir(userId, characterId) {
  return path.join(BASE_DIR, userId, 'characters', characterId);
}

/**
 * Create initial memory files for a user-character pair.
 * Returns the directory path.
 */
function createMemoryFiles(userId, characterId) {
  const dir = getUserCharDir(userId, characterId);
  fs.mkdirSync(dir, { recursive: true });

  const memoryPath = path.join(dir, 'memory.md');
  const diaryPath = path.join(dir, 'diary.md');
  const relationshipPath = path.join(dir, 'relationship.md');

  if (!fs.existsSync(memoryPath)) {
    fs.writeFileSync(
      memoryPath,
      `# 关于这位同学的记忆\n\n*还没有太多了解，期待更多交流！*\n`,
      'utf8'
    );
  }

  if (!fs.existsSync(diaryPath)) {
    fs.writeFileSync(
      diaryPath,
      `# 日记\n\n*还没有日记记录。*\n`,
      'utf8'
    );
  }

  if (!fs.existsSync(relationshipPath)) {
    fs.writeFileSync(
      relationshipPath,
      `# 关系状态\n\n- 阶段：初识\n- 累计学习时间：0分钟\n`,
      'utf8'
    );
  }

  return dir;
}

/**
 * Read memory files for a user-character pair.
 */
function getMemory(userId, characterId) {
  const dir = getUserCharDir(userId, characterId);

  const read = (filename) => {
    const filePath = path.join(dir, filename);
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  };

  return {
    memory: read('memory.md'),
    diary: read('diary.md'),
    relationship: read('relationship.md'),
  };
}

/**
 * Overwrite the memory.md file with new content.
 */
function updateMemory(userId, characterId, newMemory) {
  const dir = getUserCharDir(userId, characterId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'memory.md'), newMemory, 'utf8');
}

/**
 * Append a dated entry to diary.md.
 */
function addDiaryEntry(userId, characterId, entry) {
  const dir = getUserCharDir(userId, characterId);
  fs.mkdirSync(dir, { recursive: true });

  const diaryPath = path.join(dir, 'diary.md');
  const dateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const newEntry = `\n---\n## ${dateStr}\n\n${entry}\n`;

  if (fs.existsSync(diaryPath)) {
    fs.appendFileSync(diaryPath, newEntry, 'utf8');
  } else {
    fs.writeFileSync(diaryPath, `# 日记\n${newEntry}`, 'utf8');
  }
}

module.exports = { createMemoryFiles, getMemory, updateMemory, addDiaryEntry };

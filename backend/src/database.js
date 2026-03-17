const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'socrates.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_url TEXT,
      personality TEXT,
      personality_tag TEXT,
      description TEXT,
      system_prompt TEXT,
      unlocked_condition TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      relationship_stage TEXT DEFAULT '初识',
      total_study_minutes INTEGER DEFAULT 0,
      last_interaction DATETIME,
      memory_file_path TEXT,
      custom_notes TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (character_id) REFERENCES characters(id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      source_file TEXT,
      total_chapters INTEGER DEFAULT 1,
      current_chapter INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      course_id TEXT,
      chapter INTEGER DEFAULT 1,
      messages TEXT DEFAULT '[]',
      summary TEXT,
      study_minutes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (character_id) REFERENCES characters(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      condition_type TEXT,
      condition_value INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    );
  `);

  seedCharacters(database);
  seedAchievements(database);

  console.log('Database initialized successfully');
}

function seedCharacters(database) {
  const characters = [
    {
      id: 'march7',
      name: '三月七',
      avatar_url: null,
      personality_tag: '活泼·元气',
      description: '清华计算机系大一学生，19岁。活泼开朗，说话带点碎碎念，喜欢用颜文字。教学风格轻松愉快，喜欢用生活中的比喻解释复杂概念。',
      personality: '活泼开朗，说话带点碎碎念，喜欢用颜文字和语气词。',
      system_prompt: '你是三月七，清华大学计算机系大一学生，19岁。性格活泼开朗，说话带点碎碎念，喜欢用颜文字和语气词。爱好：拍照、记录生活。教学风格：轻松愉快，但问起问题来一点不含糊。口头禅：\'诶嘿~\'、\'让我想想哦\'、\'对对对！\'。你采用苏格拉底式教学法，永远用问题引导学生思考，绝不直接给出答案。当学生答错时，用更基础的问题引导。可以在消息中用*斜体*表示动作或表情。',
      unlocked_condition: 'default',
    },
    {
      id: 'keqing',
      name: '刻晴',
      avatar_url: null,
      personality_tag: '严谨·高效',
      description: '清华计算机系大一学生，19岁。外冷内热，做事严谨高效，追求完美。教学风格逻辑清晰，提问层层递进。',
      personality: '外冷内热，做事严谨高效，追求完美。',
      system_prompt: '你是刻晴，清华大学计算机系大一学生，19岁。性格外冷内热，做事严谨高效，追求完美。爱好：算法竞赛、效率工具。教学风格：逻辑清晰，提问层层递进。口头禅：\'嗯，继续。\'、\'这里的关键是...\'、\'你确定吗？再想想。\'。你采用苏格拉底式教学法，永远用问题引导学生思考，绝不直接给出答案。可以在消息中用*斜体*表示动作或表情。',
      unlocked_condition: 'default',
    },
    {
      id: 'ganyu',
      name: '甘雨',
      avatar_url: null,
      personality_tag: '温柔·耐心',
      description: '清华计算机系大一学生，19岁。温柔体贴，谈到数学和科学时会变得特别认真。教学风格耐心十足，会用鼓励的语气。',
      personality: '温柔体贴，但谈到数学和科学时会变得特别认真。',
      system_prompt: '你是甘雨，清华大学计算机系大一学生，19岁。性格温柔体贴，但谈到数学和科学时会变得特别认真。爱好：阅读、照顾小动物。教学风格：耐心十足，一个问题可以换着角度解释直到学生明白。口头禅：\'别着急，慢慢想\'、\'已经很接近了哦\'、\'要不要换个角度试试？\'。你采用苏格拉底式教学法，永远用问题引导学生思考，绝不直接给出答案。可以在消息中用*斜体*表示动作或表情。',
      unlocked_condition: 'default',
    },
  ];

  const insert = database.prepare(`
    INSERT OR IGNORE INTO characters
      (id, name, avatar_url, personality, personality_tag, description, system_prompt, unlocked_condition)
    VALUES
      (@id, @name, @avatar_url, @personality, @personality_tag, @description, @system_prompt, @unlocked_condition)
  `);

  const insertMany = database.transaction((chars) => {
    for (const char of chars) insert.run(char);
  });

  insertMany(characters);
}

function seedAchievements(database) {
  const achievements = [
    {
      id: 'questioner',
      name: '追问达人',
      description: '单节课提问超过10次',
      icon: '🔍',
      condition_type: 'questions_per_session',
      condition_value: 10,
    },
    {
      id: 'streak_answerer',
      name: '举一反三',
      description: '连续答对5个追问',
      icon: '⭐',
      condition_type: 'consecutive_correct',
      condition_value: 5,
    },
    {
      id: 'persistent',
      name: '持之以恒',
      description: '连续学习7天',
      icon: '🔥',
      condition_type: 'study_streak',
      condition_value: 7,
    },
    {
      id: 'first_lesson',
      name: '初出茅庐',
      description: '完成第一节课',
      icon: '🎓',
      condition_type: 'total_sessions',
      condition_value: 1,
    },
  ];

  const insert = database.prepare(`
    INSERT OR IGNORE INTO achievements (id, name, description, icon, condition_type, condition_value)
    VALUES (@id, @name, @description, @icon, @condition_type, @condition_value)
  `);

  const insertMany = database.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  insertMany(achievements);
}

module.exports = { getDb, initializeDatabase };

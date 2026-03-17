const OpenAI = require('openai').default;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

let openaiClient = null;

function getOpenAIClient() {
  if (!OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Build the Socratic teaching system prompt from character data, memory, and course context.
 */
function buildSystemPrompt(character, memory, course) {
  let prompt = character.system_prompt || '';

  if (memory) {
    if (memory.memory) {
      prompt += `\n\n## 你对这位同学的了解\n${memory.memory}`;
    }
    if (memory.relationship) {
      prompt += `\n\n## 你们的关系\n${memory.relationship}`;
    }
  }

  if (course) {
    prompt += `\n\n## 当前学习课程\n课程名称：${course.title}`;
    if (course.description) {
      prompt += `\n课程描述：${course.description}`;
    }
    prompt += `\n当前章节：第${course.current_chapter}章 / 共${course.total_chapters}章`;
    prompt += `\n\n请围绕本课程的内容进行苏格拉底式引导，帮助学生掌握本章节的知识点。`;
  }

  prompt += `

## 核心原则（必须遵守）
1. 永远不要直接给出答案。用问题引导学生自己发现答案。
2. 当学生答错时，不要批评，而是提出更基础的问题帮助他们找到正确思路。
3. 当学生答对时，给予鼓励，然后继续提出更深层的问题。
4. 保持你的性格特征，让对话自然流畅。
5. 每次回复控制在150字以内，保持对话节奏。`;

  return prompt;
}

/**
 * Generate a mock Socratic response based on conversation context.
 * Tries to be context-aware: extracts subject keywords from recent messages.
 */
function generateMockResponse(messages, character) {
  const name = character.name;
  const tag = character.personality_tag || '';

  // Extract the last user message for context
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUserMsg ? lastUserMsg.content : '';

  // Detect topic keywords
  const mathKeywords = ['数学', '方程', '导数', '积分', '矩阵', '向量', '概率', 'math', '计算', '公式'];
  const csKeywords = ['算法', '代码', '编程', '函数', '递归', '循环', '变量', '数组', 'python', 'java', 'c++', '数据结构', '时间复杂度'];
  const physicsKeywords = ['物理', '力', '速度', '加速度', '能量', '电流', '磁场', '光', '波'];

  const lower = userText.toLowerCase();
  const isMath = mathKeywords.some((k) => lower.includes(k));
  const isCS = csKeywords.some((k) => lower.includes(k));
  const isPhysics = physicsKeywords.some((k) => lower.includes(k));

  let topicQuestions = [];

  if (isMath) {
    topicQuestions = [
      '你能先告诉我，这个概念的基本定义是什么吗？',
      '如果我们把这个问题分解成更小的步骤，第一步应该是什么？',
      '你有没有试过用一个具体的数字例子来验证一下？',
      '这让你想到了哪个我们之前学过的公式？',
      '如果把这个图形画出来，会是什么形状呢？',
    ];
  } else if (isCS) {
    topicQuestions = [
      '你觉得这个算法的时间复杂度是多少？为什么？',
      '如果输入是边界情况，比如空数组，这段代码会怎么运行？',
      '能不能先用伪代码描述一下你的思路？',
      '这个问题让你想到了哪种数据结构？',
      '如果要优化这个方案，你会从哪里入手？',
    ];
  } else if (isPhysics) {
    topicQuestions = [
      '根据你学过的物理定律，这个现象背后的原理是什么？',
      '如果我们改变其中一个变量，结果会怎么变化？',
      '能不能用一个生活中的例子来描述这个现象？',
      '画一个受力分析图，你觉得有哪些力在起作用？',
    ];
  } else {
    topicQuestions = [
      '你觉得这个问题的核心是什么？',
      '能不能换一种方式来解释你的想法？',
      '如果让你向一个完全不了解这个话题的人解释，你会怎么说？',
      '你有没有想到任何反例？',
      '这个结论是基于什么假设的？',
    ];
  }

  const randomQ = topicQuestions[Math.floor(Math.random() * topicQuestions.length)];

  // Character-flavored wrappers
  const wrappers = {
    march7: [
      `*歪头想了想* 诶嘿~ ${randomQ}`,
      `让我想想哦～ ${randomQ} (◕‿◕)`,
      `对对对，你说的有点意思！那${randomQ}`,
    ],
    keqing: [
      `嗯，继续。${randomQ}`,
      `*放下笔* 这里的关键是... ${randomQ}`,
      `你确定吗？再想想。${randomQ}`,
    ],
    ganyu: [
      `别着急，慢慢想。${randomQ}`,
      `*轻轻点头* 已经很接近了哦。${randomQ}`,
      `要不要换个角度试试？${randomQ}`,
    ],
  };

  const charWrappers = wrappers[character.id] || [`${name}：${randomQ}`];
  return charWrappers[Math.floor(Math.random() * charWrappers.length)];
}

/**
 * Call OpenAI (or return mock if no API key).
 */
async function generateResponse(messages, character) {
  const client = getOpenAIClient();

  if (!client) {
    return generateMockResponse(messages, character);
  }

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.85,
    });
    return completion.choices[0]?.message?.content?.trim() || generateMockResponse(messages, character);
  } catch (err) {
    console.error('OpenAI API error:', err.message);
    return generateMockResponse(messages, character);
  }
}

/**
 * Generate a diary entry for the character based on the conversation.
 */
async function generateDiary(character, conversationText, currentMemory) {
  const client = getOpenAIClient();

  if (!client) {
    return generateMockDiary(character, conversationText);
  }

  const prompt = `你是${character.name}，${character.personality}
请根据下面这段和同学的学习对话，用第一人称写一篇简短的日记（100字以内），
记录今天的学习互动、你对同学的观察和感受。语气符合你的性格。

对话内容：
${conversationText.slice(0, 1500)}

日记：`;

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.9,
    });
    return completion.choices[0]?.message?.content?.trim() || generateMockDiary(character, conversationText);
  } catch (err) {
    console.error('OpenAI diary error:', err.message);
    return generateMockDiary(character, conversationText);
  }
}

function generateMockDiary(character, conversationText) {
  const name = character.name;
  const diaries = {
    march7: `今天和同学一起学习，感觉好开心(≧▽≦) 他/她很认真，虽然有时候会卡住，但只要多问几个问题就能找到思路了。期待下次继续！`,
    keqing: `今日学习记录。该同学学习态度认真，逻辑思维有待加强。通过逐步引导，最终能够得出正确结论。效率尚可，继续保持。`,
    ganyu: `今天的学习很愉快。同学很努力，每次遇到困难都没有放弃。看到他/她慢慢理解的样子，我也觉得很有成就感。要继续加油哦～`,
  };
  return diaries[character.id] || `今天和同学进行了一次学习交流，收获颇丰。`;
}

/**
 * Generate group chat messages between characters discussing a diary entry.
 */
async function generateGroupChat(characters, diaryEntry) {
  const client = getOpenAIClient();

  if (!client) {
    return generateMockGroupChat(characters, diaryEntry);
  }

  const charNames = characters.map((c) => c.name).join('、');
  const prompt = `以下是几位同学的日记片段：
${diaryEntry}

请模拟${charNames}之间的一段简短群聊对话（3-5条消息），话题围绕这篇日记内容，
每条消息格式：[角色名]: 消息内容。保持各角色的性格特点。`;

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.9,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '';
    return parseGroupChatLines(text, characters);
  } catch (err) {
    console.error('OpenAI group chat error:', err.message);
    return generateMockGroupChat(characters, diaryEntry);
  }
}

function parseGroupChatLines(text, characters) {
  return text.split('\n')
    .filter((line) => line.includes(':'))
    .map((line) => {
      const colonIdx = line.indexOf(':');
      const speaker = line.slice(0, colonIdx).replace(/^\[|\]$/g, '').trim();
      const content = line.slice(colonIdx + 1).trim();
      const char = characters.find((c) => c.name === speaker);
      return { characterId: char ? char.id : null, speaker, content };
    })
    .filter((m) => m.content);
}

function generateMockGroupChat(characters, diaryEntry) {
  const lines = [
    { characterId: 'march7', speaker: '三月七', content: '诶嘿~ 你们今天学习怎么样啊？(◕‿◕)' },
    { characterId: 'keqing', speaker: '刻晴', content: '还不错。关键是要找到核心问题所在。' },
    { characterId: 'ganyu', speaker: '甘雨', content: '同学们都很努力呢，慢慢来，一定会进步的～' },
  ];
  return lines.filter((l) => characters.some((c) => c.id === l.characterId));
}

module.exports = {
  buildSystemPrompt,
  generateResponse,
  generateDiary,
  generateGroupChat,
};

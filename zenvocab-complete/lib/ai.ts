const API_KEY = 'sk-0f4f41e41790477ea92c525d9e354f96';
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

export interface AIResponse {
  example: string;
  exampleTranslation: string;
  mnemonic: string;
}

export async function generateWordContent(word: string): Promise<AIResponse> {
  const prompt = `请为单词"${word}"生成学习辅助内容，要求：
1. 一个简短、地道的英文例句（10-15个词）
2. 该例句的中文翻译
3. 一个有趣的中文助记方法（可以是词根记忆、谐音联想等）

请严格按照以下JSON格式返回，不要有任何额外文字：
{
  "example": "英文例句",
  "exampleTranslation": "中文翻译",
  "mnemonic": "助记方法"
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('AI generation failed:', error);
    // 返回默认内容
    return {
      example: `I need to learn the word "${word}".`,
      exampleTranslation: `我需要学习单词"${word}"。`,
      mnemonic: '暂时无法生成助记，请稍后重试。'
    };
  }
}

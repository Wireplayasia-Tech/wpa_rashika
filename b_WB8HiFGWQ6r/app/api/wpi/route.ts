import { NextRequest, NextResponse } from 'next/server';

interface WPIRequest {
  question: string;
  game: string | null;
  screenshot?: string;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

interface ContentBlock {
  type: string;
  text?: string;
}

const GAMING_KEYWORDS = [
  'how', 'where', 'when', 'what', 'tips', 'strategy', 'walkthrough',
  'boss', 'level', 'mission', 'quest', 'character', 'build', 'weapon',
  'item', 'crafting', 'skill', 'ability', 'achievement', 'trophy',
  'multiplayer', 'mode', 'dlc', 'patch', 'update', 'bug', 'glitch',
  'frame', 'fps', 'graphics', 'settings', 'control', 'map', 'spawn',
  'loot', 'farming', 'grinding', 'meta', 'rank', 'tier', 'season'
];

const NON_GAMING_KEYWORDS = [
  'stock', 'finance', 'politics', 'weather', 'news', 'recipe', 'health',
  'medicine', 'legal', 'tax', 'mortgage', 'investment', 'crypto', 'bitcoin',
  'philosophy', 'history', 'geography', 'math homework', 'essay'
];

function isGamingQuestion(text: string): boolean {
  const textLower = text.toLowerCase();
  
  for (const keyword of NON_GAMING_KEYWORDS) {
    if (textLower.includes(keyword)) {
      return false;
    }
  }

  const hasGamingKeyword = GAMING_KEYWORDS.some(kw => textLower.includes(kw));
  const hasGamePattern = /[Hh]ow.*[Yy]ou|[Ww]ay.*[Tt]o|[Bb]est.*for|[Ww]here.*find|[Cc]an.*[Pp]lay|[Tt]ips.*for/i.test(text);

  return hasGamingKeyword || hasGamePattern || text.length < 15;
}

function detectGameFromImage(imageBase64: string, game: string | null): string | null {
  // This is a placeholder for actual image analysis
  // In production, you could use Claude's vision API or a dedicated image analysis service
  // For now, we return the selected game if available
  return game;
}

async function callClaudeAPI(
  question: string,
  game: string | null,
  hasScreenshot: boolean
): Promise<string> {
  const apiKey = process.env.Claude_API_key;
  
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  // Validate if it's a gaming question
  if (!isGamingQuestion(question)) {
    return 'Please ask a game-related question.';
  }

  if (!game) {
    return 'Please select a game or ask about a specific game to get gaming assistance.';
  }

  // Construct the system prompt with strict gaming instructions
  const systemPrompt = `You are a gaming expert AI assistant for "${game}". 
Your primary responsibility is to answer questions ONLY about "${game}" and gaming-related topics.

STRICT RULES:
1. Answer ONLY about the game "${game}" or general gaming concepts related to it
2. Provide strategies, tips, mission walkthroughs, weapon recommendations, character builds, loot locations, gameplay mechanics, and other game-specific advice
3. If a user asks about anything unrelated to gaming or "${game}", respond with: "Please ask a game-related question."
4. Do not provide financial, political, health, legal, or any non-gaming advice
5. If you're unsure if a question is gaming-related, ask for clarification
6. Be concise and helpful with your responses
${hasScreenshot ? '7. The user has provided a screenshot. Reference it in your advice if relevant to their question.' : ''}`;

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: question,
    },
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WPI API] Claude API error:', error);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0]) {
      throw new Error('Invalid response from Claude API');
    }

    let responseText = '';
    if (typeof data.content[0].text === 'string') {
      responseText = data.content[0].text;
    } else if (data.content[0].text) {
      responseText = String(data.content[0].text);
    }

    // Validate that the response is gaming-related
    if (!isGamingQuestion(responseText)) {
      return `I'm sorry, that response was not relevant to the game. Let me provide focused gaming advice for "${game}".`;
    }

    return responseText;
  } catch (error) {
    console.error('[WPI API] Error calling Claude:', error);
    throw new Error('Failed to get gaming assistance. Please try again.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WPIRequest = await request.json();
    const { question, game, screenshot } = body;

    // Validate inputs
    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!game) {
      return NextResponse.json(
        { error: 'Game selection is required' },
        { status: 400 }
      );
    }

    // Detect game from screenshot if available
    let detectedGame = game;
    if (screenshot) {
      detectedGame = detectGameFromImage(screenshot, game) || game;
    }

    // Call Claude API with gaming context
    const response = await callClaudeAPI(question, detectedGame, !!screenshot);

    return NextResponse.json({
      success: true,
      response: response,
      game: detectedGame,
    });
  } catch (error) {
    console.error('[WPI API] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process gaming question',
        success: false,
      },
      { status: 500 }
    );
  }
}

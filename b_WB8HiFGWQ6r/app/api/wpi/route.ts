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

async function detectGameFromImage(imageBase64: string, game: string | null): Promise<string | null> {
  const apiKey = process.env.Claude_API_key;
  
  if (!apiKey) {
    console.error('[WPI API] Claude API key not configured for game detection');
    return game;
  }

  // If a game is already selected, trust that selection
  if (game) {
    return game;
  }

  try {
    console.log('[WPI API] Detecting game from screenshot');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64.split(',')[1] || imageBase64,
                },
              },
              {
                type: 'text',
                text: 'What video game is this screenshot from? Respond with ONLY the game name. If you cannot identify it, respond with "Unknown Game".',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WPI API] Game detection error:', error);
      return null;
    }

    const data = await response.json();
    const detectedGame = data.content[0]?.text?.trim() || '';

    if (detectedGame && detectedGame !== 'Unknown Game') {
      console.log('[WPI API] Detected game from screenshot:', detectedGame);
      return detectedGame;
    }

    console.log('[WPI API] Could not detect specific game from screenshot');
    return null;
  } catch (error) {
    console.error('[WPI API] Game detection error:', error);
    return null;
  }
}

async function validateScreenshotIsGaming(screenshotBase64: string): Promise<{ isGaming: boolean; reason: string }> {
  const apiKey = process.env.Claude_API_key;
  
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  try {
    console.log('[WPI API] Validating screenshot for gaming content');

    // Extract base64 data, handling both data URLs and raw base64
    let base64Data = screenshotBase64;
    if (screenshotBase64.includes(',')) {
      base64Data = screenshotBase64.split(',')[1];
    }

    // Determine media type from data URL or default to jpeg
    let mediaType = 'image/jpeg';
    if (screenshotBase64.includes('data:image/png')) {
      mediaType = 'image/png';
    } else if (screenshotBase64.includes('data:image/gif')) {
      mediaType = 'image/gif';
    } else if (screenshotBase64.includes('data:image/webp')) {
      mediaType = 'image/webp';
    }

    console.log('[WPI API] Image media type:', mediaType);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: 'Is this a screenshot from a video game? Respond with only YES or NO.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WPI API] Image validation error:', error);
      // If validation fails, assume it's gaming content and let the main API handle it
      return {
        isGaming: true,
        reason: 'Validation inconclusive - proceeding with gaming content assumption',
      };
    }

    const data = await response.json();
    const analysisText = data.content[0]?.text || '';
    const isGaming = analysisText.toUpperCase().includes('YES');

    console.log('[WPI API] Screenshot validation result:', isGaming, 'Response:', analysisText);

    return {
      isGaming,
      reason: analysisText,
    };
  } catch (error) {
    console.error('[WPI API] Screenshot validation error:', error);
    // On error, assume it's gaming content to avoid blocking valid screenshots
    return {
      isGaming: true,
      reason: 'Validation inconclusive - proceeding with gaming content assumption',
    };
  }
}

async function callClaudeAPI(
  question: string,
  game: string | null,
  hasScreenshot: boolean
): Promise<string> {
  const apiKey = process.env.Claude_API_key;
  
  if (!apiKey) {
    console.error('[WPI API] Claude API key not configured');
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
    console.log('[WPI API] Calling Claude API for game:', game);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    console.log('[WPI API] Claude API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('[WPI API] Claude API error:', error);
      throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('[WPI API] Claude response received:', data.id);
    
    if (!data.content || !data.content[0]) {
      throw new Error('Invalid response from Claude API');
    }

    let responseText = '';
    if (typeof data.content[0].text === 'string') {
      responseText = data.content[0].text;
    } else if (data.content[0].text) {
      responseText = String(data.content[0].text);
    }

    return responseText;
  } catch (error) {
    console.error('[WPI API] Error calling Claude:', error);
    throw error;
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

    // Validate screenshot if provided and detect game from it
    let detectedGame = game;
    if (screenshot) {
      try {
        console.log('[WPI API] Validating uploaded screenshot');
        const validation = await validateScreenshotIsGaming(screenshot);
        
        if (!validation.isGaming) {
          console.log('[WPI API] Screenshot is not gaming-related');
          return NextResponse.json(
            { error: 'The uploaded image does not appear to be from a video game. Please upload a screenshot from the game you selected.' },
            { status: 400 }
          );
        }

        // Try to detect the game from the screenshot if no game was selected
        if (!game) {
          console.log('[WPI API] No game selected, attempting to detect from screenshot');
          const detected = await detectGameFromImage(screenshot, null);
          if (detected) {
            detectedGame = detected;
            console.log('[WPI API] Game detected from screenshot:', detected);
          } else {
            console.log('[WPI API] Could not detect specific game from screenshot, requesting user clarification');
          }
        }
      } catch (error) {
        console.error('[WPI API] Screenshot processing error:', error);
        // Don't fail on validation errors - let the user continue
        console.log('[WPI API] Proceeding despite validation error');
      }
    }

    // Require a game to be available (either selected or detected)
    if (!detectedGame) {
      return NextResponse.json(
        { error: 'Please select a game or upload a screenshot from a game.' },
        { status: 400 }
      );
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

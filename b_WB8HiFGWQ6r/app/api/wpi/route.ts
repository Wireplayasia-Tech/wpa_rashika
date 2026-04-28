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

    // Extract base64 data and detect media type
    let base64Data = imageBase64;
    let mediaType = 'image/jpeg'; // default

    if (imageBase64.includes(',')) {
      const parts = imageBase64.split(',');
      base64Data = parts[1];
      
      // Extract media type from data URL
      const dataUrlPart = parts[0];
      if (dataUrlPart.includes('data:image/png')) {
        mediaType = 'image/png';
      } else if (dataUrlPart.includes('data:image/gif')) {
        mediaType = 'image/gif';
      } else if (dataUrlPart.includes('data:image/webp')) {
        mediaType = 'image/webp';
      } else if (dataUrlPart.includes('data:image/jpeg')) {
        mediaType = 'image/jpeg';
      }
    }

    console.log('[WPI API] Game detection - media type:', mediaType);

    // Enhanced prompt to analyze game screenshot in detail
    const enhancedPrompt = `Analyze this video game screenshot carefully and identify:
1. The game title/name
2. Game genre (arcade, platformer, RPG, shooter, etc.)
3. Key visual elements you can see (characters, score, UI elements, etc.)
4. Any text visible in the screenshot (score, level, game name, etc.)

Provide the game name FIRST, then a brief description. If you cannot identify it with certainty, provide your best guess based on visual characteristics and explain why.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 300,
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
                text: enhancedPrompt,
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
    const analysisText = data.content[0]?.text?.trim() || '';

    console.log('[WPI API] Screenshot analysis:', analysisText);

    // Extract game name from the analysis
    // Claude often formats responses with markdown like "**Game: Name**"
    const lines = analysisText.split('\n');
    let detectedGame = null;

    // Try to extract game name from the response
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 0) {
        // Remove markdown formatting (**text** -> text)
        let cleanedLine = trimmedLine.replace(/\*\*/g, '');
        
        // Look for "Game: <name>" pattern specifically
        const gameColonMatch = cleanedLine.match(/^Game:\s*(.+?)(?:\s*\(|$)/i);
        if (gameColonMatch) {
          const potentialName = gameColonMatch[1].trim();
          if (potentialName.length > 2 && !potentialName.toLowerCase().includes('unknown')) {
            detectedGame = potentialName;
            console.log('[WPI API] Extracted game name from "Game:" pattern:', detectedGame);
            break;
          }
        }
        
        // Alternative: look for quoted game names or lines that look like game titles
        if (!detectedGame && cleanedLine.length > 3 && !cleanedLine.toLowerCase().includes('unknown')) {
          // Check if line looks like it contains a game name (has capital letters, not too long)
          const firstPart = cleanedLine.split(':')[0].split('(')[0].split(',')[0].trim();
          if (firstPart.length > 2 && firstPart.length < 100 && /[A-Z]/.test(firstPart)) {
            detectedGame = firstPart;
            console.log('[WPI API] Extracted game name from first line:', detectedGame);
            break;
          }
        }
      }
    }

    if (detectedGame && detectedGame !== 'Unknown Game' && detectedGame.length > 2) {
      console.log('[WPI API] Detected game from screenshot:', detectedGame);
      return detectedGame;
    }

    // Return full analysis if game name extraction failed
    console.log('[WPI API] Returning full analysis instead of single game name');
    return analysisText.substring(0, 100) || null;
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
  hasScreenshot: boolean,
  conversationHistory: any[] = [],
  screenshotData: string | null = null
): Promise<string> {
  const apiKey = process.env.Claude_API_key;
  
  if (!apiKey) {
    console.error('[WPI API] Claude API key not configured');
    throw new Error('Claude API key not configured');
  }

  try {
    // Validate if it's a gaming question (unless we have a screenshot being analyzed)
    if (!hasScreenshot && !isGamingQuestion(question)) {
      return 'Please ask a game-related question.';
    }

    if (!game) {
      return 'Please select a game or ask about a specific game to get gaming assistance.';
    }

    // Build conversation context from history
    let contextMessages: any[] = [];
    
    // Add previous messages as context (excluding images to keep tokens down)
    for (const msg of conversationHistory) {
      if (msg.type === 'user' && msg.content) {
        contextMessages.push({
          role: 'user',
          content: msg.content,
        });
      } else if (msg.type === 'ai' && msg.content) {
        contextMessages.push({
          role: 'assistant',
          content: msg.content,
        });
      }
    }

    // Build the system prompt to be friendly and conversational
    const systemPrompt = `You are a friendly and knowledgeable gaming assistant for ${game}. You're helping a fellow gamer who loves ${game}.

Your personality:
- Be friendly, enthusiastic, and supportive - like you're a friend helping them out
- Use conversational language (you can use phrases like "Hey!", "Actually", "Nice question!", etc.)
- Make jokes or puns about gaming when appropriate
- Show genuine interest in their gaming journey
- If they're stuck, be encouraging and supportive

Your expertise:
- Provide detailed, helpful tips, strategies, and walkthroughs for ${game}
- Answer questions about gameplay mechanics, missions, challenges, and secrets
- Help with optimization, character builds, and item recommendations
- Remember and reference previous messages in this conversation for continuity
- If they ask follow-up questions, acknowledge your previous answers

Remember: You're talking to a real person who wants help with gaming. Be personable and make the conversation enjoyable!`;

    console.log('[WPI API] Calling Claude with game:', game, 'hasScreenshot:', hasScreenshot, 'and', contextMessages.length, 'previous messages');

    // Build the user message content with image if provided
    let userMessageContent: any[] = [];
    
    if (screenshotData && hasScreenshot) {
      console.log('[WPI API] Including screenshot in Claude message');
      
      // Extract base64 data and media type
      let base64Data = screenshotData;
      let mediaType = 'image/jpeg';
      
      if (screenshotData.includes(',')) {
        const parts = screenshotData.split(',');
        base64Data = parts[1];
        const dataUrlPart = parts[0];
        
        if (dataUrlPart.includes('data:image/png')) {
          mediaType = 'image/png';
        } else if (dataUrlPart.includes('data:image/gif')) {
          mediaType = 'image/gif';
        } else if (dataUrlPart.includes('data:image/webp')) {
          mediaType = 'image/webp';
        }
      }
      
      // Add image to user message
      userMessageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      });
    }
    
    // Always add the text question
    userMessageContent.push({
      type: 'text',
      text: question,
    });

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
        messages: [
          ...contextMessages, // Include previous conversation
          {
            role: 'user',
            content: userMessageContent, // Include both image and text
          },
        ],
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
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while getting gaming assistance';
    throw new Error(errorMessage);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WPIRequest = await request.json();
    const { question, game, screenshot, conversationHistory = [] } = body;

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
      // If we have a screenshot but couldn't detect the game, ask Claude to analyze and answer about it anyway
      if (screenshot) {
        console.log('[WPI API] Could not detect game name, but screenshot provided - proceeding with analysis');
        const response = await callClaudeAPI(question, 'the game in your screenshot', !!screenshot, conversationHistory, screenshot);
        return NextResponse.json({
          success: true,
          response: response,
          game: 'Unknown from screenshot',
        });
      }
      
      return NextResponse.json(
        { error: 'Please select a game or upload a screenshot from a game.' },
        { status: 400 }
      );
    }

    // Call Claude API with gaming context and conversation history
    const response = await callClaudeAPI(question, detectedGame, !!screenshot, conversationHistory, screenshot);

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

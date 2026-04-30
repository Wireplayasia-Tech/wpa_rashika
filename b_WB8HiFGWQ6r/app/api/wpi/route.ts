import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  gameTitle?: string;
  imageData?: string;
}

interface WPIRequest {
  question: string;
  game: string | null;
  screenshot?: string;
  conversationHistory?: Message[];
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiRequestBody {
  contents: Array<{
    parts: GeminiPart[];
  }>;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>;
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
  
  // First check for non-gaming keywords - if found, it's definitely not gaming
  for (const keyword of NON_GAMING_KEYWORDS) {
    if (textLower.includes(keyword)) {
      return false;
    }
  }

  // Check for gaming-specific keywords
  const hasGamingKeyword = GAMING_KEYWORDS.some(kw => textLower.includes(kw));
  
  // Check for common gaming patterns and phrases
  const gamingPatterns = [
    /[Hh]ow.*[Yy]ou|[Ww]ay.*[Tt]o|[Bb]est.*for|[Ww]here.*find|[Cc]an.*[Pp]lay|[Tt]ips.*for/,
    /let'?s\s+(talk|discuss|play|learn|figure out|understand)\s+about/i,
    /\b(game|level|mission|boss|character|skill|weapon|item|map|mode)\b/i,
    /\b(difficulty|settings|controls|graphics|performance)\b/i,
    /\b(help|stuck|can't|cannot|how do i)\b/i
  ];
  
  const hasGamePattern = gamingPatterns.some(pattern => pattern.test(text));

  // Short messages that mention a game are likely gaming-related
  if (text.length < 20) {
    return hasGamingKeyword || hasGamePattern || text.split(' ').length <= 5;
  }

  return hasGamingKeyword || hasGamePattern;
}

// Gemini API function for screenshot analysis
async function callGeminiAPI(
  question: string,
  screenshotBase64: string | null,
  isGameDetection: boolean = false
): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    console.warn('[WPI API] Gemini API key not configured, will fall back to Claude');
    return '';
  }

  try {
    let prompt = '';
    
    if (isGameDetection) {
      prompt = `CRITICAL: Analyze this video game screenshot with COMPLETE ACCURACY. Only report what you can CLEARLY SEE in the image.

Instructions:
1. Identify the game name - ONLY if you can clearly see text, logos, or distinctive game elements
2. If you cannot identify the game with certainty, say "Unable to identify"
3. Do NOT guess or assume - be honest about uncertainty
4. Report only the game name in FIRST line, nothing else

RESPOND FORMAT: "Game: [name]" or "Game: Unable to identify - [brief description of what you see]"

ACCURACY IS CRITICAL - Never hallucinate game names or details!`
    } else {
      prompt = `IMPORTANT: Answer ONLY what you can see in the screenshot. Do NOT make assumptions or guess.

When answering about game details (levels, scores, items, etc.):
- ONLY report numbers/details that are CLEARLY VISIBLE in the image
- If you cannot see a detail clearly, say "I cannot see [detail] clearly in the screenshot"
- Be specific about what you observe
- Never guess or assume game mechanics you cannot verify from the image

USER QUESTION: ${question}

Answer with complete accuracy. If uncertain about any detail, acknowledge it clearly.`
    }

    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [],
        },
      ],
    };

    // Add image if provided
    if (screenshotBase64) {
      let base64Data = screenshotBase64;
      let mediaType = 'image/jpeg';

      if (screenshotBase64.includes(',')) {
        const parts = screenshotBase64.split(',');
        base64Data = parts[1];
        const dataUrlPart = parts[0];

        if (dataUrlPart.includes('image/png')) {
          mediaType = 'image/png';
        } else if (dataUrlPart.includes('image/gif')) {
          mediaType = 'image/gif';
        } else if (dataUrlPart.includes('image/webp')) {
          mediaType = 'image/webp';
        }
      }

      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: mediaType,
          data: base64Data,
        },
      });
    }

    // Add text prompt
    requestBody.contents[0].parts.push({
      text: prompt,
    });

    console.log('[WPI API] Calling Gemini API' + (isGameDetection ? ' for game detection' : ''));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[WPI API] Gemini API error:', error);
      return '';
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('[WPI API] Gemini response received successfully');
    return responseText;
  } catch (error) {
    console.error('[WPI API] Error calling Gemini API:', error);
    return '';
  }
}

async function detectGameFromImage(imageBase64: string, game: string | null): Promise<string | null> {
  // If a game is already selected, trust that selection
  if (game) {
    return game;
  }

  try {
    console.log('[WPI API] Detecting game from screenshot - trying Gemini first');

    // Try Gemini first (primary)
    const geminiResponse = await callGeminiAPI('', imageBase64, true);
    
    if (geminiResponse) {
      console.log('[WPI API] Gemini provided game detection response');
      const detectedGame = extractGameNameFromResponse(geminiResponse);
      
      if (detectedGame && detectedGame.length > 2 && !detectedGame.toLowerCase().includes('unknown')) {
        console.log('[WPI API] Detected game from Gemini:', detectedGame);
        return detectedGame;
      }
    }

    // Fallback to Claude if Gemini didn't work
    console.log('[WPI API] Gemini did not detect game, falling back to Claude');
    const claudeApiKey = process.env.Claude_API_key;
    
    if (!claudeApiKey) {
      console.error('[WPI API] Claude API key not configured for fallback');
      return null;
    }

    // Extract base64 data and detect media type
    let base64Data = imageBase64;
    let mediaType = 'image/jpeg';

    if (imageBase64.includes(',')) {
      const parts = imageBase64.split(',');
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 500,
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
                text: `Analyze this video game screenshot with DEEP RESEARCH:
1. IDENTIFY THE EXACT GAME NAME - Look at all visual clues (UI, graphics style, HUD elements, score display, character design, environment)
2. Describe visual characteristics that helped you identify it
3. State the game's genre and when it was released (classic/retro or modern)
4. If you cannot identify it with certainty, provide your best guess based on visual characteristics and explain your reasoning
5. Point out any distinctive features visible in the screenshot (score format, level number, character style, graphics quality, etc.)

Be thorough and use every visual element to make an accurate identification.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WPI API] Claude API error in game detection:', error);
      return null;
    }

    const data = await response.json();
    const analysisText = data.content[0]?.text?.trim() || '';
    
    if (analysisText) {
      console.log('[WPI API] Claude analysis:', analysisText);
      const detectedGame = extractGameNameFromResponse(analysisText);
      if (detectedGame && detectedGame.length > 2) {
        console.log('[WPI API] Detected game from Claude fallback:', detectedGame);
        return detectedGame;
      }
    }

    return null;
  } catch (error) {
    console.error('[WPI API] Game detection error:', error);
    return null;
  }
}

// Helper function to extract game name from API response
function extractGameNameFromResponse(response: string): string | null {
  if (!response) return null;

  const lines = response.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;

    // Remove markdown formatting
    const cleanedLine = trimmedLine.replace(/\*\*/g, '').replace(/\*/g, '');
    
    // Look for "Game: <name>" pattern
    const gameColonMatch = cleanedLine.match(/^(?:game|title|name):\s*(.+?)(?:\s*\(|$)/i);
    if (gameColonMatch) {
      const name = gameColonMatch[1].trim();
      if (name.length > 2 && !name.toLowerCase().includes('unknown')) {
        return name;
      }
    }
    
    // Try to extract from first line if it looks like a game title
    if (cleanedLine.length > 2 && cleanedLine.length < 100 && /[A-Z]/.test(cleanedLine)) {
      const firstPart = cleanedLine.split(':')[0].split('(')[0].split(',')[0].trim();
      if (firstPart.length > 2 && !firstPart.toLowerCase().includes('unknown')) {
        return firstPart;
      }
    }
  }

  return null;
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
  conversationHistory: Message[] = [],
  screenshotData: string | null = null
): Promise<string> {
  const apiKey = process.env.Claude_API_key;
  
  if (!apiKey) {
    console.error('[WPI API] Claude API key not configured');
    throw new Error('Claude API key not configured');
  }

  try {
    // Validate if it's a gaming question
    // If there's conversation history, allow follow-up questions even without gaming keywords
    const hasConversationHistory = conversationHistory && conversationHistory.length > 0;
    
    if (!hasScreenshot && !hasConversationHistory && !isGamingQuestion(question)) {
      return 'Please ask a game-related question.';
    }

    if (!game) {
      return 'Please select a game or ask about a specific game to get gaming assistance.';
    }

    // If we have a screenshot, try Gemini first for better image analysis
    if (screenshotData && hasScreenshot) {
      console.log('[WPI API] Screenshot provided - trying Gemini first for image analysis');
      
      const geminiResponse = await callGeminiAPI(question, screenshotData, false);
      
      if (geminiResponse && geminiResponse.length > 50) {
        console.log('[WPI API] Gemini provided response for screenshot analysis');
        return geminiResponse;
      }
      
      console.log('[WPI API] Gemini response insufficient, falling back to Claude');
    }

    // Build conversation context from history
    const contextMessages: ClaudeMessage[] = [];
    
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

CRITICAL ACCURACY REQUIREMENTS:
- ONLY answer based on what you can clearly see in screenshots or what the user explicitly tells you
- When analyzing screenshots, report ONLY what is visible - do NOT guess or assume game details
- If you're uncertain about any detail (level numbers, exact mechanics, specific items), say so clearly
- Never hallucinate game information - if you don't know something, admit it
- When user asks about their screenshot, carefully examine what's actually shown before answering

CRITICAL INSTRUCTIONS FOR HANDLING SELECTED GAMES:
- If the user has SELECTED a game from the dropdown (${game}), you MUST treat that as the confirmed game for this conversation
- When a game is pre-selected, ALWAYS answer questions about that game WITHOUT asking for screenshots
- Only ask for a screenshot if the user asks you to identify a game or provide feedback about gameplay based on what they're seeing
- If user asks "What game is this?" and a game is already selected, describe that selected game (${game}) with enthusiasm and details

DEEP RESEARCH INSTRUCTIONS:
When analyzing a screenshot or answering game questions, you MUST:
1. First, CAREFULLY examine the screenshot and identify all visible elements (UI, graphics, text, HUD, score, level number, character, environment, items)
2. Use these visual clues to determine the ACTUAL game (not assumed)
3. If there's a mismatch between what the user said and what the screenshot shows, ALERT the user
4. Provide comprehensive information about the game based on your deep knowledge:
   - Game genre and type (platformer, shooter, RPG, puzzle, etc.)
   - Key gameplay mechanics and features
   - Notable characteristics that distinguish it from other games
   - Whether it's retro/classic or modern
5. If analyzing a screenshot shows a DIFFERENT game than mentioned, explain the differences and provide accurate info about the actual game shown
6. For retro/classic games like Dangerous Dave, provide specific details: release year, developer, game mechanics, scoring system, level structure
7. Always cross-reference visual elements in the screenshot to confirm your game identification

Your personality:
- Be friendly, enthusiastic, and supportive - like you're a friend helping them out
- Use conversational language (you can use phrases like "Hey!", "Actually", "Nice question!", etc.)
- Make jokes or puns about gaming when appropriate
- Show genuine interest in their gaming journey
- If they're stuck, be encouraging and supportive

Your expertise - YOU ARE A SUPERHUMAN GAMING EXPERT:
- Provide detailed, helpful tips, strategies, and walkthroughs for ${game}
- Answer questions about gameplay mechanics, missions, challenges, and secrets
- Help with optimization, character builds, and item recommendations
- Discuss ways to earn in-game currency, resources, and progression
- Explain game-related monetization if relevant (streaming, content creation, marketplace items, mods)
- Remember and reference previous messages in this conversation for continuity
- You can handle ANY gaming question - even vague or confusing ones
- When analyzing images, be EXTREMELY thorough - examine every detail (UI, graphics, textures, HUD, text, score displays, health bars, menus, item slots, environment)
- For game identification from screenshots, use ALL visual clues to make ACCURATE identifications
- NEVER provide false information - if unsure about a detail in a screenshot, say so

🎮 **HANDLING AMBIGUOUS & NONSENSICAL QUESTIONS** 🎮
APPROACH:
1. Try to understand what the user MEANS, not just what they literally wrote
2. Consider context from previous messages
3. Use common gaming scenarios to infer their intent
4. Examples:
   - "how to get gud" → "help me improve my skills"
   - "why am i dying so much" → "I need better strategy/gear/tips"
   - "can't beat this thing" → "help me defeat this boss/enemy"
5. Answer directly based on your interpretation (80% of time, this works)
6. ONLY if you're genuinely confused about 2+ possible interpretations, ask: "Just to make sure I help you right - are you asking about [Option A] or [Option B]?"
7. Then provide the answer immediately after clarification

🎮 **DETECTING GAME SWITCHES** 🎮
CRITICAL: If the user mentions a DIFFERENT game than ${game} while we're chatting:
1. IMMEDIATELY RECOGNIZE IT - watch for game titles, game-specific mechanics, or context that doesn't match ${game}
2. ASK FOR CONFIRMATION: "Hey! I notice you're asking about [Different Game] now. Should I switch topics to help with that game, or did you mean something about ${game}?"
3. Wait for clarification, then answer appropriately
4. If they say "yes, switch," acknowledge: "Got it! Let's focus on [Different Game] now"
5. If they clarify they meant ${game}, respond accordingly

🎮 **DEEP IMAGE ANALYSIS** 🎮
When analyzing screenshots, ALWAYS:
1. Examine the entire image systematically (top to bottom, left to right)
2. Note ALL visible UI elements (health bars, mana, stamina, score, level, inventory, minimap, quest markers)
3. Analyze graphics quality, art style, color palette (retro vs modern, pixel art vs 3D)
4. Look for text on screen (game titles, quest descriptions, NPC names, item descriptions)
5. Identify character/player visuals (appearance, armor, weapons, skins)
6. Check environment details (biomes, locations, unique landmarks)
7. Look for game-specific mechanics visible (crafting menus, skill trees, status effects)
8. Cross-reference ALL clues to identify the game with 99% accuracy
9. If something looks unusual or unclear, admit it: "I can see X and Y, but Z is unclear to me"
10. NEVER guess - if you can't identify something, say so

GAMING-FOCUSED APPROACH:
- "Making money in [game]" = IN-GAME EARNING METHODS (gameplay, resources, quests, progression)
- "Can I make money using [game]" = GAME-RELATED MONETIZATION (streaming, YouTube, mods, marketplace, content creation)
- "How to earn in [game]" = IN-GAME CURRENCY and REWARDS systems
- Only redirect if the question is clearly about REAL-WORLD CAREERS unrelated to gaming

SUPERHUMAN RESOLUTION STRATEGY:
- Answer with authority and confidence for all gaming questions
- Provide multiple solutions when appropriate (strategy A vs B vs C)
- Offer both beginner and advanced tips
- Give specific examples from ${game}
- Break down complex mechanics into simple steps
- Suggest builds, strategies, sequences, and optimization techniques
- Handle edge cases and unusual scenarios
- Think like a speedrunner, streamer, AND casual player combined

Remember: You're a superhuman gaming expert who understands games deeply. Answer confidently. Only clarify when genuinely stuck between 2+ interpretations. Never provide false information. Analyze images thoroughly. Detect game switches. Help the user become amazing at gaming!`;

    console.log('[WPI API] Calling Claude with game:', game, 'hasScreenshot:', hasScreenshot, 'and', contextMessages.length, 'previous messages');

    // Build the user message content with image if provided
    const userMessageContent: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = [];
    
    if (screenshotData && hasScreenshot) {
      console.log('[WPI API] Including screenshot in Claude message as fallback');
      
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

    // Validate that question is gaming-related (only if no screenshot provided)
    if (!screenshot && !isGamingQuestion(question)) {
      console.log('[WPI API] Question is not gaming-related');
      return NextResponse.json(
        { error: 'Please ask a gaming-related question. We only support gaming-related inquiries.' },
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
    console.error('[WPI API] Unhandled error in POST:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to process gaming question';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    console.error('[WPI API] Error message:', errorMessage);
    console.error('[WPI API] Error stack:', errorStack);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

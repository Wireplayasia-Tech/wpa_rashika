# Deployment Guide - Wireplay Interactive (WPI) Gaming Assistant

## Environment Variables Required

This project requires the following environment variables to be set on your server:

### 1. **Gemini API Key**
- **Variable Name:** `GEMINI_API_KEY`
- **Where Used:** Game detection from screenshots
- **How to Get:**
  1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
  2. Create a new API key
  3. Copy the key

### 2. **Claude API Key**
- **Variable Name:** `Claude_API_key` (Note: Case-sensitive!)
- **Where Used:** Main gaming assistant responses and deep research analysis
- **How to Get:**
  1. Go to [Anthropic Console](https://console.anthropic.com/account/keys)
  2. Create a new API key
  3. Copy the key

## Where to Add Environment Variables

### **Option 1: For Local Development**
Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key_here
Claude_API_key=your_claude_api_key_here
```

### **Option 2: For Production Server Deployment**

#### **If using Linux/Ubuntu with systemd:**
1. Create a `.env` file in your project root with the variables
2. When starting the application, ensure the env vars are exported:
   ```bash
   export GEMINI_API_KEY=your_gemini_api_key_here
   export Claude_API_key=your_claude_api_key_here
   npm start
   ```

Or in your systemd service file:
```ini
[Service]
Environment="GEMINI_API_KEY=your_gemini_api_key_here"
Environment="Claude_API_key=your_claude_api_key_here"
ExecStart=/usr/bin/npm start
```

#### **If using Docker:**
Create a `.env` file and pass it to Docker:
```bash
docker run --env-file .env your-image-name
```

#### **If using Heroku:**
Set via CLI:
```bash
heroku config:set GEMINI_API_KEY=your_gemini_api_key_here
heroku config:set Claude_API_key=your_claude_api_key_here
```

#### **If using AWS/GCP/Azure:**
Set environment variables in your deployment configuration (Lambda, App Engine, App Service, etc.)

## Build and Deploy Steps

### 1. **Clone/Download the Project**
```bash
git clone <your-repo-url>
cd b_WB8HiFGWQ6r
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Build the Project**
```bash
npm run build
```

### 4. **Set Environment Variables**
Add `GEMINI_API_KEY` and `Claude_API_key` to your server environment

### 5. **Start the Application**
```bash
npm start
```

The application will run on `http://localhost:3000` by default.

## How to Verify Everything Works

### Test 1: Check Environment Variables are Loaded
1. Open browser console (F12)
2. Look at the terminal/server logs when the app starts
3. You should NOT see "GEMINI_API_KEY is not set" or "Claude API key not configured" errors

### Test 2: Access the WPI Feature
1. Navigate to `/products` page
2. Look for the "Wireplay Interactive (WPI)" card
3. Click on it to open the modal
4. Select a game or upload a screenshot

### Test 3: Ask a Gaming Question
1. Select "Dangerous Dave" or any game
2. Type: "How do I beat level 5?"
3. Click "Send"
4. **Expected:** Get a response from Claude about the game (NOT an API error)
5. **Should NOT see:** "Error: API error: 400"

### Test 4: Upload and Analyze a Screenshot
1. In WPI modal, upload a gaming screenshot
2. Type a question about it
3. Click "Send"
4. **Expected:** AI identifies the game and provides tips
5. **Should NOT see:** "Error" or "undefined" responses

### Test 5: Check API Calls in Network Tab
1. Open Developer Tools → Network tab
2. Ask a question in WPI
3. Look for POST request to `/api/wpi`
4. **Expected:** Status 200 (success)
5. **Not OK:** Status 400, 500, or connection errors

### Test 6: Review Server Logs
In your terminal where the app is running, look for these log messages:
```
[WPI API] Calling Claude with game: [GameName]
[WPI API] API response received
[v0] WPI: API response status: 200
```

**NOT OK:** Messages like:
```
Error: GEMINI_API_KEY is not set
Error: Claude API key not configured
Error: fetch failed
Error: 401 Unauthorized
```

## Troubleshooting

### Issue: "API error: 401" or "Unauthorized"
- **Cause:** API keys are incorrect or expired
- **Solution:** 
  1. Verify keys are copied correctly (no extra spaces)
  2. Check key is active in Google AI Studio / Anthropic Console
  3. Regenerate a new key if needed

### Issue: "API error: 400"
- **Cause:** Question is not gaming-related
- **Solution:** Ask about a specific game (e.g., "Tips for PUBG" instead of "Tell me about stocks")

### Issue: "Cannot find module" errors
- **Cause:** Dependencies not installed
- **Solution:** Run `npm install` again

### Issue: App runs but WPI returns empty responses
- **Cause:** API keys might be set but responses aren't being processed
- **Solution:** Check browser console for errors and server logs for API call details

## Files to Reference

The main files handling API calls and environment variables:

1. **`/app/api/wpi/route.ts`** - All WPI API logic
   - Line 72: `process.env.GEMINI_API_KEY`
   - Line 202, 326, 422: `process.env.Claude_API_key`

2. **`/components/wpi/WPIModal.tsx`** - Frontend for WPI chat

3. **`/components/wpi/WPIFeature.tsx`** - WPI feature card

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to version control
- Never share your API keys
- Use a `.gitignore` file to exclude `.env*` files:
  ```
  .env
  .env.local
  .env.*.local
  ```
- On production, use your server's secret management (AWS Secrets Manager, Vault, etc.)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify API keys are active and valid
4. Test API keys independently using curl or Postman
5. Check network connectivity to Google/Anthropic APIs

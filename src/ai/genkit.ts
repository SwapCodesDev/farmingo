
import { genkit } from 'genkit';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

export const ai = genkit({
  plugins: [],
});

function getGroqApiKey() {
  let key = process.env.GROQ_API_KEY;
  if (!key || key === 'idonthaveit') {
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GROQ_API_KEY\s*=\s*([^\r\n]+)/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    } catch (e) {
      console.error('Failed to read .env file for GROQ_API_KEY:', e);
    }
  }
  return key;
}

export const groq = new Groq({
  apiKey: getGroqApiKey(),
});

export const GROQ_MODELS = {
  text: 'llama-3.3-70b-versatile',
  vision: 'llama-3.2-11b-vision-preview',
};

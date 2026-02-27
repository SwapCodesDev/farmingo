
import { genkit } from 'genkit';
import Groq from 'groq-sdk';

export const ai = genkit({
  plugins: [],
});

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODELS = {
  text: 'llama-3.3-70b-versatile',
  vision: 'llama-3.2-11b-vision-preview',
};

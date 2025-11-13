'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/crop-disease-diagnosis.ts';
import '@/ai/flows/crop-price-prediction.ts';
import '@/ai/flows/weather-prediction.ts';
import '@/ai/flows/translate-text.ts';

const { GoogleGenAI } = require('@google/genai');
const { Translate } = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');
const path = require('path');

// Initialize Google Gemini AI
const ai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_AI_API_KEY || "AIzaSyBJkyeHP5BnuqGQEIDRku_nfNzZBFJU7Kk" 
});

// Initialize Google Translate
const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID || 'fit2095-a3',
  key: process.env.GOOGLE_TRANSLATE_API_KEY || 'AIzaSyCf36M0dXg_jyf95FPSgdREBfvgJeJ3JTk'
});

// Initialize Google Text-to-Speech
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, '../fit2095.json')
});

module.exports = {
  ai,
  translate,
  ttsClient
};

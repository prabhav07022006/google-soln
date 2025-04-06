require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); 
const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
app.use(express.json());
app.use(cors());
const fuzz = require('fuzzball');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',(req,res) =>{

    const htmlfile=path.join(__dirname,'index.html')
    res.sendFile(htmlfile);
})  
app.listen(4000,() => {
    console.log("Server is running");
})

const allowedQuestions = [
    "What kind of diet should I follow?",
  "Can you suggest a good diet plan?",
  "What should I eat if I have diabetes?",
  "Suggest foods good for high blood pressure.",
  "What foods should I avoid for cholesterol?",
  "Tell me some healthy eating tips.",
  "What are the symptoms of a fever?",
  "How can I stay fit and healthy?",
  "Tell me some home remedies for cold.",
  "What are the benefits of drinking water?",
  "How much sleep is necessary for adults?",
  "Can I exercise with a fever?",
  "How can I boost my immunity?",
  "What are the symptoms of COVID-19?",
  "What should I eat for better digestion?"
];
app.use(express.json());
app.use(cors());
app.get('/questions', (req, res) => {
    res.json(allowedQuestions);
  });
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const match = fuzz.extract(userMessage, allowedQuestions, { scorer: fuzz.token_set_ratio, returnObjects: true })[0];
  if (match.score < 80) {
    return res.json({ reply: "Sorry, I can only answer specific questions." });
  }
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: userMessage +"Please follow these rules while answering: 1.Please answer concisely 2. Do not provide irrelevant information.3. Answer in simple, easy-to-understand language.5. Answer in a kind and soft tone.6. The answer should not exceed 60 words.7.Do not answer any suspicious questions" }]
            }
          ]
        }
      );
  
      const reply = response.data.candidates[0].content.parts[0].text;
      res.json({ reply });
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch from Gemini API' });
    }
  });
  

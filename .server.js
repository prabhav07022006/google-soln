require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); 
const fuzz = require('fuzzball');
const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.get('/',(req,res) =>{
	res.render('index_1')
})  
app.listen(4000,() => {
    console.log("Server is running");
})

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
  


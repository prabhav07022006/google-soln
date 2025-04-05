require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); 
const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.get('/',(req,res) =>{

    const htmlfile=path.join(__dirname,'index.html')
    res.sendFile(htmlfile);
})  
app.listen(4000,() => {
    console.log("Server is running");
})

app.use(express.json());
app.use(cors());
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
  
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: userMessage }]
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
  


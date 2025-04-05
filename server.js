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
    const userMessage = req.body.message; // Extract user input from frontend

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: userMessage }] }]
            }
        );

        const botReply = response.data.candidates[0]?.content?.parts[0]?.text || "No response";
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        res.status(500).json({ error: "Failed to connect to Gemini API" });
    }
});


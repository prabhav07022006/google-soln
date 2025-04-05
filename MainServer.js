const express  = require('express');
const app      = express();
const path     = require('path');
const mongoose = require('mongoose');
const user     = require('./UserSchema');
const { type } = require('os');
const cors     = require('cors');
const axios    = require('axios'); 

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(cors());

require('dotenv').config();
app.use(express.static(path.join(__dirname, 'public')));


mongoose.set('strictQuery', true);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(trimmer);
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/test')
	.then(()=>{console.log('db connected')})

function trimmer(req, res, next){
	if(req.method == 'POST'){
		for (const [key, value] of Object.entries(req.body)) {
      if (typeof(value) === 'string');
        req.body[key] = value.trim();
    }
	}
	next();
}



app.set('view engine', 'ejs');

app.get('/', (req, res)=>{
	res.redirect('/login');
})

app.post('/create',async (req, res)=>{
	console.log(req.body);
	try {
		var body = req.body;
		const ola = await user.find({'email': req.body.email});
		console.log("yo ola printin!", ola);
		if(ola!=undefined){
			console.log("user exists");
			res.redirect('/');
		}else{
			user.create(body);
			console.log("user created safely");
			res.redirect('/login');
		}
	} catch (error){
		res.status(500).json("error happening UwU"+{message: error.message});
	}
})

app.get('/login', (req, res)=>{
	res.render('index');
})


app.post('/login',async (req, res)=>{
	console.log(req.body)
	try {
		if(req.body.emaiL!=undefined){
			const db_data = await user.find({"email":req.body.emaiL});
			if(db_data!=undefined){
				if(req.body.passworD==db_data[0].password){
					console.log('you logged in');
					res.redirect('/user');
				}else{
					res.redirect('/login');
					console.log('wrong password');
				}
			}else{
				console.log('no such user');
			}
		}else{
			console.log("invalid input");
			res.redirect('/login');
		}
	} catch (error) {
		console.log(error);
		res.redirect('/login');
	}
})

app.get('/user', (req, res)=>{
	res.render('index_1');
})

app.get('/api/find', async (req, res)=>{
	var ola = await user.find({});
	console.log(ola);
	res.render('index_1');
})

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
  }catch (error) {
    console.error('API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Gemini API' });
  }
});

app.listen(4000,() => {
  console.log("Server is running");
})



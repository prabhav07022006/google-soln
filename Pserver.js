const express  = require('express');
const app			 = express();
const { type } = require('os');
const cors     = require('cors');
const axios    = require('axios');
const fuzz     = require('fuzzball');
const path     = require('path');
const { database, password } = require('pg/lib/defaults');
const pgp			 = require('pg-promise')();
require('dotenv').config();

const conn		 = {
	host: 'localhost',
	port: 5432,
	database: 'testdb',
	user: 'postgres',
	password: 'post',
};
const db			 = pgp(conn);

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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(trimmer);

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
		const check = await db.any('select * from userlog where email like ($1)', body.email);
		if(check[0]!==undefined){
			console.log("user found", check);
			res.redirect('/');
		}else{
			const ret = await db.none('insert into userlog(email, passwd) values($1, $2)',[body.email, body.password]);
			res.redirect('/login');
		}
	} catch (error){
		res.status(500).json("error happening UwU"+{message: error.message});
	}
})


app.get('/login', (req, res)=>{
	res.render('index');
})



app.get('/questions', (req, res) => {
  res.json(allowedQuestions);
});



app.post('/login',async (req, res)=>{
	const ID = req.body.emaiL;
	try {
		const check = await db.any("SELECT passwd from userlog Where email like($1)", [ID]);
		if(check[0].passwd==req.body.passworD){
			console.log("logged in");
			res.redirect(`/user/${ID}`);
		}
	} catch (error) {
		console.log(error);
		res.redirect('/login');
	}
})



app.get('/user/:id',async (req, res)=>{
	const id = req.params.id;
	const check = await db.any("SELECT * from userdata where email like($1)", [id]);
	const response = await check[0];
	if(check[0].email!==undefined){
		res.render('home', {
			currMeds: response.currmeds,
			currDiag: response.currdiag,
			pastMeds: response.pastmeds,
			pastDiag: response.pastdiag,
			email: response.email,
		});
	}else{
		res.render('home', {
			currMeds: "internal error",
			currDiag: "internal error",
			pastMeds: "internal error",
			pastDiag: "inernal error",
			email: "inernal error",

		})
	}
})



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

app.get('/aiChat', (req, res)=>{
	res.render('index_1');
})


app.listen(4000, ()=>{
	console.log("server is running");
})

const express = require('express');
const path = require('path');
const app = express();
app.get('/',(req,res) =>{

    const htmlfile=path.join(__dirname,'index.html')
    res.sendFile(htmlfile);
})  
app.listen(4000,() => {
    console.log("Server is running");
})
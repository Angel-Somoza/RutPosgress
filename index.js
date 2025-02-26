const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/User', (req, res) => {
    res.status(200);
    res.send("Pruebas para consumo de la api")
    console.log("entraron")
});

app.listen(PORT, (error) =>
{
    if(!error){
        console.log("server is running")
    }else{
        console.log("server error")
    }
});

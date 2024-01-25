const express = require('express');// Express makes APIs (connect fronted to database)

const Redis = require('redis');//Import the Redis Class from the Library

const bodyParser = require('body-parser');

const redisClient = Redis.createClient({
    url:`redis://localhost:6379`
});

const app = express();// Create an express application
const port = 3000;//this is port number

app.use(bodyParser.json());

// app.listen(3000);// Listen for web requests from the fronted and don't stop
app.listen(port,()=>{
    redisClient.connect();
    console.log(`API is Listening on port: ${port}`) //template literal
});// Listen for web requests from the fronted and don't stop

app.post('/boxes', async (req,res)=>{//async means we will await promises
    const newBox = req.body;// body only works if you have bodyParse.json
    newBox.id = parseInt(await redisClient.json.arrLen('boxes', '$')) + 1;//User shouldn't be allowed to choose the ID
    await redisClient.json.arrAppend('boxes','$',newBox); // saves JSON in redis
    res.json(newBox);//respond with the new box
});

// 1 - URL
// 2 - A function to return boxes
// req = teh request from the browser
// res = the response to the browser
app.get('/boxes',async (req,res)=>{
    let boxes = await redisClient.json.get('boxes',{path: '$'});//get the boxes
    // Send boxes to the browser
    res.send(JSON.stringify(boxes));//covert boxes to a string
});//Return boxes to the user


console.log("Hello");
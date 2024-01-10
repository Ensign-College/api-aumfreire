const express = require('express');// Express makes APIs (connect fronted to database)

const app = express();// Create an express application

app.listen(3000);// Listen for web requests from the fronted and don't stop

const boxes = [
    {boxId:1},
    {boxId:2},
    {boxId:3},
    {boxId:4}
];

//1 - URL
// 2 - A function to return boxes
// req = teh request from the browser
// res = the response to the browser
app.get('/boxes',(req,res)=>{
    // Send boxes to the browser
    res.send(JSON.stringify(boxes));//covert boxes to a string
});//Return boxes to the user


console.log("Hello");
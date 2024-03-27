const Redis = require("redis");
const { addOrderItem, getOrderItem } = require("./services/orderItems");
const { addOrder, getOrder } = require("./services/orderservice");
const fs = require("fs");
const Schema = JSON.parse(fs.readFileSync("./services/orderItemSchema.json", "utf8"));
const Ajv = require("ajv");
const ajv = new Ajv();

const redisClient = Redis.createClient({
  url: `redis://localhost:6379`
});

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : null;

  try {
    if (method === 'GET' && path === '/boxes') {
      const boxes = await redisClient.json.get("boxes", { path: "$" });
      return {
        statusCode: 200,
        body: JSON.stringify(boxes[0])
      };
    } else if (method === 'POST' && path === '/boxes') {
      const newBox = body;
      newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1;
      await redisClient.json.arrAppend("boxes", "$", newBox);
      return {
        statusCode: 200,
        body: JSON.stringify(newBox)
      };
    } else if (method === 'POST' && path === '/orders') {
      // Handle orders
      // Your existing /orders endpoint logic goes here
    } else if (method === 'GET' && path.startsWith('/orders/')) {
      // Handle get order by ID
      // Your existing /orders/:orderId endpoint logic goes here
    } else if (method === 'POST' && path === '/orderItems') {
      // Handle order items
      // Your existing /orderItems endpoint logic goes here
    } else if (method === 'GET' && path.startsWith('/orderItems/')) {
      // Handle get order item by ID
      // Your existing /orderItems/:orderItemId endpoint logic goes here
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found" })
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};

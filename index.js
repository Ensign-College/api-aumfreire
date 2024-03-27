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

// Handler for /boxes endpoint
exports.boxesHandler = async (event, context) => {
  try {
    const boxes = await redisClient.json.get("boxes", { path: "$" });
    return {
      statusCode: 200,
      body: JSON.stringify(boxes[0])
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};

// Handler for /orders endpoint
exports.ordersHandler = async (event, context) => {
  // Your logic for handling orders
};

// Handler for /orderItems endpoint
exports.orderItemsHandler = async (event, context) => {
  // Your logic for handling order items
};

// Handler for /orders/{orderId} endpoint
exports.ordersByIdHandler = async (event, context) => {
  // Your logic for handling orders by ID
};

// Handler for /orderItems/{orderItemId} endpoint
exports.orderItemsByIdHandler = async (event, context) => {
  // Your logic for handling order items by ID
};

// Ensure all handler functions are exported
module.exports = {
  boxesHandler: exports.boxesHandler,
  ordersHandler: exports.ordersHandler,
  orderItemsHandler: exports.orderItemsHandler,
  ordersByIdHandler: exports.ordersByIdHandler,
  orderItemsByIdHandler: exports.orderItemsByIdHandler
};

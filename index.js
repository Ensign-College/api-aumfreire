const express = require("express");
const Redis = require("redis");
const bodyParser = require("body-parser");
const cors = require("cors");
const { addOrderItem, getOrderItem } = require("./services/orderItems");
const { addOrder, getOrder } = require("./services/orderservice");
const fs = require("fs");
const Ajv = require("ajv");

const Schema = JSON.parse(fs.readFileSync("./services/orderItemSchema.json", "utf8"));
const ajv = new Ajv();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/boxes", async (req, res) => {
  let boxes = await redisClient.json.get("boxes", { path: "$" });
  res.json(boxes[0]);
});

app.post("/boxes", async (req, res) => {
  const newBox = req.body;
  newBox.id = parseInt(await redisClient.json.arrLen("boxes", "$")) + 1;
  await redisClient.json.arrAppend("boxes", "$", newBox);
  res.json(newBox);
});

app.post("/orders", async (req, res) => {
  let order = req.body;
  console.log("Received order:", order);
  let responseStatus =
    order.productQuantity && order.shippingAddress ? 200 : 400;

  if (responseStatus === 200) {
    try {
      const createdOrder = await addOrder({ redisClient, order });
      console.log("Created order:", createdOrder);
      res.status(200).json({ message: "Order added successfully", order: createdOrder });
    } catch (error) {
      console.error(error);
      res.status(400).send("Internal server error");
      return;
    }
  } else {
    res.status(responseStatus);
    res.send(
      `Missing required fields: ${
        order.productQuantity ? "" : "productQuantity"
      }${order.shippingAddress ? "" : "shippingAddress"}`
    );
  }
});

app.get("/orders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  let order = await getOrder({ redisClient, orderId });
  if (order === null) {
    res.status(404).send("Order not found");
  } else {
    res.json(order);
  }
});

app.post("/orderItems", async (req, res) => {
  try {
    console.log("Schema:", Schema);
    const validate = ajv.compile(Schema);
    const valid = validate(req.body);
    if (!valid) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    console.log("Request Body:", req.body);

    const orderItemId = await addOrderItem({
      redisClient,
      orderItem: req.body,
    });

    res
      .status(201)
      .json({ orderItemId, message: "Order item added successfully" });
  } catch (error) {
    console.error("Error adding order item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/orderItems/:orderItemId", async (req, res) => {
  try {
    const orderItemId = req.params.orderItemId;
    const orderItem = await getOrderItem({ redisClient, orderItemId });
    res.json(orderItem);
  } catch (error) {
    console.error("Error getting order item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the app for AWS Lambda
exports.handler = async (event, context) => {
  const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`API is listening on port: ${port}`);
  });
};

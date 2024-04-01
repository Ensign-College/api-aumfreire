const Redis = require("redis");
const { addOrderItem, getOrderItem } = require("./services/orderItems");
const { addOrder, getOrder } = require("./services/orderservice");
const fs = require("fs");
const Ajv = require("ajv");

const Schema = JSON.parse(
  fs.readFileSync("./services/orderItemSchema.json", "utf8")
);
const ajv = new Ajv();

const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});

// Connect the Redis client
redisClient.connect((err) => {
  if (err) {
    console.error("Failed to connect to Redis:", err);
  } else {
    console.log("Connected to Redis");
  }
});

// Handler for /boxes endpoint
exports.boxesHandler = async (event, context) => {
  redisClient.connect().catch(console.error);
  try {
    const boxes = await redisClient.json.get("boxes", { path: "$" });
    return {
      statusCode: 200,
      body: JSON.stringify(boxes[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

// Handler for /orders endpoint
exports.ordersHandler = async (event, context) => {
  redisClient.connect().catch(console.error);
  try {
    const order = JSON.parse(event.body);
    let responseStatus = order.productQuantity
      ? 200
      : 400 && order.shippingAddress
      ? 200
      : 400;

    if (responseStatus === 200) {
      try {
        await addOrder({ redisClient, order });
      } catch (error) {
        console.error(error);
        return {
          statusCode: 500,
          body: "Internal Server Error",
        };
      }
    }

    return {
      statusCode: responseStatus,
      body:
        responseStatus === 200
          ? ""
          : `Missing one of the following fields: ${exactMatchOrderFields()} ${partiallyMatchOrderFields()}`,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: "Invalid request body",
    };
  }
};

// Handler for /orderItems endpoint
exports.orderItemsHandler = async (event, context) => {
  redisClient.connect().catch(console.error);
  try {
    const validate = ajv.compile(Schema);
    const valid = validate(JSON.parse(event.body));
    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    const orderItemId = await addOrderItem({
      redisClient,
      orderItem: JSON.parse(event.body),
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        orderItemId,
        message: "Order item added successfully",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

// Handler for /orders/{orderId} endpoint
exports.ordersByIdHandler = async (event, context) => {
  redisClient.connect().catch(console.error);
  try {
    const orderId = event.pathParameters.orderId;
    const order = await getOrder({ redisClient, orderId });

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

// Handler for /orderItems/{orderItemId} endpoint
exports.orderItemsByIdHandler = async (event, context) => {
  redisClient.connect().catch(console.error);
  try {
    const orderItemId = event.pathParameters.orderItemId;
    const orderItem = await getOrderItem({ redisClient, orderItemId });

    return {
      statusCode: 200,
      body: JSON.stringify(orderItem),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

// Ensure all handler functions are exported
module.exports = {
  boxesHandler: exports.boxesHandler,
  ordersHandler: exports.ordersHandler,
  orderItemsHandler: exports.orderItemsHandler,
  ordersByIdHandler: exports.ordersByIdHandler,
  orderItemsByIdHandler: exports.orderItemsByIdHandler,
};

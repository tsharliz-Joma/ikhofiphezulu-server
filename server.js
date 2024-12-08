require("dotenv").config({ path: "./config.env" });
require("dotenv").config({ path: "./env.dev" });
const express = require("express");
const cors = require("cors");
const http = require("http");
const PORT = process.env.PORT || 1969;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const CoffeeModel = require("./models/Coffee");
const User = require("./models/User");
const Admin = require("./models/Admin");
const sendText = require("./clickSendApi");
const sendTeamsMessage = require("./teamsSendApi");
const getToken = require("./teamsSendApi");
const { decrypt, encrypt, coffeeObject } = require("./helperFunctions");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const winston = require("winston");
const helmet = require("helmet");
const xxs = require("xss-clean");
const hpp = require("hpp");

const app = express();
const server = http.createServer(app);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 30 minutes",
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res
      .status(429)
      .json({
        status: "error",
        message: "Too many requests from this IP, please try again after 30 minutes",
      });
  },
});

const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts. Please try again later.",
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res
      .status(429)
      .json({ status: "error", message: "Too many login attempts. Please try again later." });
  },
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xxs()); // Prevent XSS attacks
app.use(helmet()); // Secure HTTP headers
app.use(hpp()); // Prevent HTTP param pollution
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const io = new Server(server, {
  cors: {
    origin: [
      "https://ikhofiphezulu.web.app",
      "http://localhost:3000",
      "https://ikhofiphezulu-server-19652a0dabe7.herokuapp.com/",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri, {
    useUnifiedTopology: true,
  })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error(`Error connecting to MongoDB: ${err}`));

const mongoClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useUnifiedTopology: true,
  },
});

// Socket io
io.on("connection", (socket) => {
  logger.info("Client connected");
  const clientCollection = mongoClient.db("coffee_orders").collection("white_coffees");
  const changeStream = clientCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const order = change.fullDocument;
      socket.emit("new order", order);
    }
  });

  socket.on("order complete", (data) => {
    socket.broadcast.emit("update", data);
  });

  socket.on("disconnect", () => {
    logger.info("Client disconnected");
  });
});

async function runConnection() {
  try {
    // connect client to the server
    await mongoClient.connect();
    // send a ping to confirm success
    await mongoClient.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You Connected successfully to MongoDb");
  } finally {
    // Ensure the client will close when finished or an error occurs
    // I have to turn this off, it causes and error with the collection.watch
    // client.close();
  }
}

runConnection().catch(console.dir);

// ViEW ORDERS ROUTE
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await CoffeeModel.find({});
    if (orders.length === 0) {
      return res.json({ status: "error", error: "No Coffee Orders" });
    } else {
      return res.json({ status: "ok", orders: orders });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", error: "Error Fetching Orders" });
  }
});

// UPDATE ORDER STATUS ROUTE
app.post("/api/orders/updateStatus", async (req, res) => {
  const { orderId, newStatus } = req.body;

  try {
    const updated = await CoffeeModel.updateOne({ _id: orderId }, { $set: { status: newStatus } });
    if (updated.modifiedCount > 0) {
      io.emit("order status update", { orderId, status: newStatus });
      res.json({ status: "ok", message: "Order status updated" });
    } else {
      res.status(404).json({ status: "error", message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// CREATE COFFEE ORDER ROUTE
app.post("/api/coffee", async (req, res) => {
  const Ikhofi = coffeeObject(req);
  const coffee = new CoffeeModel(Ikhofi);
  try {
    const saved = await coffee.save();
    return res.json({ status: "ok", coffee: saved });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// DELETE COFFEE FROM DATABASE ROUTE
app.post("/api/sendCoffee", async (req, res) => {
  const Ikhofi = coffeeObject(req);
  try {
    // sendTeamsMessage(token, Ikhofi.userId)
    const data = await sendText(Ikhofi.number, Ikhofi.coffeeName);
    if (data.response_code === "SUCCESS") {
      await CoffeeModel.deleteOne(Ikhofi);
      res.json({ status: "ok", message: "Coffee sent and deleted" });
    } else {
      res.status(400).json({ status: "error", message: "Failed to send coffee" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// REGISTER ROUTE
app.post("/api/register", async (req, res) => {
  const data = await encrypt(req, 13);
  try {
    await User.create(data);
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "error", error: "Duplicate email." });
  }
});

// LOGIN ROUTE
app.post(
  "/api/login",
  limiter,
  [
    body("email").isEmail().withMessage("InValid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: "error", error: errors.array() });
    }

    try {
      const userFound = await User.findOne({
        email: req.body.email,
      });

      if (!userFound) {
        res
          .status(404)
          .json({ status: "error", error: "No account found under these credentials" });
      }
      const data = await decrypt(req, userFound);
      if (data.email && data.password) {
        const token = jwt.sign(
          {
            name: userFound.name,
            email: userFound.email,
            number: userFound.number,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.TOKEN_EXPIRY || "7h" }
        );
        return res.json({ status: "ok", user: token });
      } else {
        return res.json({ status: "error", user: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

app.post(`/api/adminDashboard`, async (req, res) => {
  try {
    return res.json({ status: "ok" }, { passwordValid: true });
  } catch (error) {
    logger.error(`[Error]: ${error.message}`, { route: "/api/adminDashboard" });
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post(
  "/api/adminLogin",
  adminLoginLimiter,
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(500).json({ status: "error", errors: errors.array() });
    }

    try {
      const admin = await Admin.findOne({
        email: req.body.email,
      });
      if (!admin) {
        return res.status(404).json({ status: "error", error: "Incorrect Credentials" });
      }
      const isPasswordValid = await bcrypt.compare(req.body.password, admin.pwd);
      if (!isPasswordValid) {
        return res.status(404).json({ status: "error", error: "Incorrect Credentials" });
      }
      const token = jwt.sign(
        {
          id: admin._id,
          name: admin.user,
          email: admin.email,
          isAdmin: admin.admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY || "7h" }
      );

      return res.json({ status: "ok", user: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

app.get("/", async (req, res) => {
  try {
    res.json({
      message: "Hello World",
    });
  } catch (error) {
    console.error(error);
  }
});

app.use((err, req, res, next) => {
  logger.error(`[Error]: ${err.message}`, {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.isOperational ? err.message : "Somthing went wrong",
  });
});

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

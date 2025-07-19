require("dotenv").config({path: "./config.env"});
require("dotenv").config({path: "./env.dev"});
const express = require("express");
const cors = require("cors");
const http = require("http");
const PORT = process.env.PORT || 1969;
const {Server} = require("socket.io");
const {MongoClient, ServerApiVersion} = require("mongodb");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xxs = require("xss-clean");
const hpp = require("hpp");
const UserRouter = require("./routes/user");
const AdminRouter = require("./routes/admin");
const PasswordRouter = require("./routes/password");
const OrderRouter = require("./routes/orders");
const SquareRouter = require("./routes/square");
const { initializePassword } = require("./lib/passwordManager");
const app = express();
const server = http.createServer(app);
const { limiter, logger } = require("./lib/winston");

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
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
      "https://coffeeup.web.app/",
      "https://ikhofiphezulu-server-19652a0dabe7.herokuapp.com/",
      "http://localhost:3000",
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
  const clientCollection = mongoClient.db("coffeeup").collection("orders");
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
    await mongoClient.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You Connected successfully to MongoDb",
    );
  } finally {
    // Ensure the client will close when finished or an error occurs
    // I have to turn this off, it causes and error with the collection.watch
    // client.close();
  }
}

runConnection().catch(console.dir);

app.use("/api", UserRouter);
app.use("/api", AdminRouter);
app.use("/api", PasswordRouter);
app.use("/api", OrderRouter);
app.use("/api", SquareRouter);

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
    message: err.isOperational ? err.message : "Something went wrong",
  });
});

server.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  await initializePassword();
});

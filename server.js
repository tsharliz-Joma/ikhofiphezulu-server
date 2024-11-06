require("dotenv").config({ path: "./config.env" });
require("dotenv").config({ path: "./.env.dev" });
const express = require("express");
const app = express();
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
const sendTeamsMessage = require("./teamsSendApi")
const getToken = require("./teamsSendApi")
// const runConnection = require("./helperFunctions")
const { decrypt, encrypt, coffeeObject } = require("./helperFunctions");
const bodyParser = require("body-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
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
const mongoUri = `mongodb+srv://${process.env.MONGO_ACC}:${process.env.MONGO_PW}@cluster0.nv1odnc.mongodb.net/coffee_orders?retryWrites=true&w=majority`;
mongoose.connect(
  mongoUri,
  {
    useNewUrlParser: true,
  },
);

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
  const clientCollection = mongoClient
    .db("coffee_orders")
    .collection("white_coffees");
  const changeStream = clientCollection.watch();

  changeStream.on("insert", (change) => {
    const message = JSON.stringify(change.fullDocument);
    socket.broadcast.emit("new order", message);
  });

  socket.on("order complete", (data) => {
    socket.broadcast.emit("update", data);
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("Websocket disconnected");
  });
});

async function runConnection() {
  try {
    // connect client to the server
    await mongoClient.connect();
    // send a ping to confirm success
    await mongoClient.db("admin").command({ ping: 1 });
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

// View orders
app.get("/api/view-orders", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const ordersFound = await CoffeeModel.find({});
    return res.json({ status: "ok", orders: ordersFound });
  } catch (error) {
    return res.json({ status: "error", error: "No Coffee Orders" });
  }
});

// CREATE COFFEE ORDER ROUTE
app.post("/api/coffee", async (req, res) => {
  const Ikhofi = coffeeObject(req);
  const coffee = new CoffeeModel(Ikhofi);
  try {
    const saved = coffee.save();
    await saved.then((response) => {
      return res.json({ status: "ok" });
    });
  } catch (error) {
    return error;
  }
});

// DELETE COFFEE FROM DATABASE ROUTE
app.post("/api/sendCoffee", async (req, res) => {
  // const token = getToken()
  const Ikhofi = coffeeObject(req);
  try {
    // sendTeamsMessage(token, Ikhofi.userId)
    const result = sendText(Ikhofi.number, Ikhofi.coffeeName);
    result.then((data) => {
      if (data.response_code === "SUCCESS") {
        const deleteFromDb = CoffeeModel.deleteOne(Ikhofi);
        console.log(deleteFromDb)
        return deleteFromDb;
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Register
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
app.post("/api/login", async (req, res) => {
  const userFound = await User.findOne({
    email: req.body.email,
  });

  if (!userFound) {
    return {
      status: "error",
      error: "No Account Found under these credentials",
    };
  }
  
  const data = await decrypt(req, userFound);

  if (data.email && data.password) {
    const token = jwt.sign(
      {
        name: userFound.name,
        email: userFound.email,
        number: userFound.number,
      },
      process.env.SUPASECRET,
    );
    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "error", user: false });
  }
});

/*
View User Data - Not being used yet
app.get("/api/user-data", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, process.env.SUPASECRET);
    const email = decoded.email;
    const user = await User.findOne({ email: email });
    return res.json({ status: "ok", name: user.name });
  } catch (error) {
    res.json({ status: "error", error: "invalid token'" });
    console.log(error);
  }
});
*/

/*
Update user data, not being used at the moment 
app.post("/api/user-data", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.verify(token, process.env.SUPASECRET);
    const email = decoded.email;
    await User.updateOne({ email: email }, { $set: { name: req.body.name } });
    return res.json({ status: "ok " });
  } catch (error) {
    // console.log(error)
    return res.json({ status: "error", error: "invalid token" });
  }
});
*/

/*
// MONGO ACCOUNT REGISTRATION - Not being used yet
app.post("/api/adminRegistration", async (req, res) => {
  console.log(req.body);
  // const newAdmin = new Admin({
  //     user: req.body.name ,
  //     pwd: req.body.password
  // });
  try {
    const bcryptPassword = await bcrypt.hash(req.body.pwd, 10);
    await Admin.create({
      user: req.body.name,
      admin: true,
      pwd: bcryptPassword,
    });
    res.json({ status: "ok " });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "Duplicate email." });
  }
});
*/

app.post("/api/adminLogin", async (req, res) => {
  const adminFound = await Admin.findOne({
    user: req.body.user,
  });

  if (!adminFound) {
    return { status: "error", error: "Incorrect Admin Credentials" };
  }

  const passwordValid = await bcrypt.compare(req.body.pwd, adminFound.pwd);
  if (passwordValid) {
    const token = jwt.sign(
      {
        name: adminFound.user,
      },
      process.env.SUPASECRET,
    );
    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "error", user: false });
  }
});

app.get("/", async (req, res) => {
  try {
    res.json({
      message: "Hello World",
    });
  } catch (error) {
    console.log(error);
  }
});

server.listen(PORT, () => {
  console.log(`Server Listening on port ${PORT}`);
});

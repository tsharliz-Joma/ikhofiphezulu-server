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

// const bodyParser = require("body-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_ACC}:${process.env.MONGO_PW}@cluster0.nv1odnc.mongodb.net/coffee_orders?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
  },
);

const mongoUri = `mongodb+srv://${process.env.MONGO_ACC}:${process.env.MONGO_PW}@cluster0.nv1odnc.mongodb.net/coffee_orders?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clientCollection = client.db("coffee_orders").collection('white_coffees')
const changeStream = clientCollection.watch()
// Socket io

io.on("connection", (socket) => {
  console.log(`Socket id: ${socket.id}`);
  console.log(`Socket handshake: ${socket.handshake.headers.origin}`);

  socket.on("user_active", (data) => {
    socket.join(data);
    console.log(data);
  });

  changeStream.on('Change', (change) => {
    const message = JSON.stringify(change);
    socket.broadcast.emit('Change', message)
  })

  socket.on("Order Complete", (data) => {
    socket.broadcast.emit("Update", data);
    console.log(data);
  });

  socket.on("new_order", (data) => {
    socket.broadcast.emit("order incoming", data);
  });

  socket.on("disconnect", () => {});
});

async function run() {
  try {
    // connect client to the server
    await client.connect();
    // send a ping to confirm success
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You Connected successfully to MongoDb",
    );
  } finally {
    // Ensure the client will close when finished or an error occurs
    // I have to turn this off, it causes and error with the collection.watch
    // client.close();
  }
}
run().catch(console.dir);

// View orders
app.get("/api/view-orders", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    await CoffeeModel.find({}).then((res) => {
      orders = res;
    });
    return res.json({ status: "ok", orders: orders });
  } catch (error) {
    return res.json({ status: "error", error: "No Coffee Orders" });
  }
});

// CREATE COFFEE ORDER ROUTE
app.post("/api/coffee", async (req, res) => {
  // Create a test here to make sure that
  // What is returned is what is intended and not malicious
  // Turn this into a function
  const name = req.body.name;
  const number = req.body.number;
  const coffeeName = req.body.coffeeName;
  const coffeeMilk = req.body.coffeeMilk;
  const coffeeSize = req.body.coffeeSize;
  // const email = req.body.email;

  const coffee = new CoffeeModel({
    name: name,
    // email: email,
    number: number,
    coffeeName: coffeeName,
    coffeeMilk: coffeeMilk,
    coffeeSize: coffeeSize,
  });
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
  // Turn this into a function
  const coffee = {
    name: req.body.name,
    number: req.body.number,
    coffeeName: req.body.coffeeName,
    coffeeSize: req.body.coffeeSize,
    coffeeMilk: req.body.coffeeMilk,
  };
  try {
    const result = sendText(coffee.number, coffee.coffeeName);
    result.then((data) => {
      if (data.response_code === "SUCCESS") {
        console.log(`Text message success`)
         const test = CoffeeModel.deleteOne(
          coffee,
        );
      return test
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Register
app.post("/api/register", async (req, res) => {

  const bcryptPassword = await bcrypt.hash(req.body.password, 10);
  const bcryptEmail = await bcrypt.hash(req.body.email, 13);
  const bcryptNumber = await bcrypt.hash(req.body.mobileNumber, 15);

  try {
    await User.create({
      name: req.body.name,
      hashedEmail: bcryptEmail,
      email: req.body.email,
      number: req.body.mobileNumber,
      password: bcryptPassword,
    });
    res.json({ status: "ok" });
  } catch (err) {
    console.log(err);
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

  const emailValid = await bcrypt.compare(
    req.body.email,
    userFound.hashedEmail,
  );

  const passwordValid = await bcrypt.compare(
    req.body.password,
    userFound.password,
  );

  if (passwordValid && emailValid) {
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

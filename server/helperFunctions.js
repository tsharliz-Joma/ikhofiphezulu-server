const jwt = require("jsonwebtoken");
const User = require("./models/User");

const Decode = (token, secret, user) => {
    const decoded = jwt.verify(token, secret);
    const email = decoded.email;
    const user = user.findOne({ email: email });
    return user.name
}

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

export { Decode, run };


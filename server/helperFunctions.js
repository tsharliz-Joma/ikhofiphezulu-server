


const coffeeObject = (req) => {
  const ikhofi = {
    person: req.body.name,
    number: req.body.number,
    coffeeName: req.body.coffeeName,
    coffeeMilk: req.body.coffeeMilk,
    coffeeSize: req.body.coffeeSize,
    getValues(){
      return  {
        person: this.name,
        number: this.number,
        coffee: this.coffeeName,
        milk: this.coffeeMilk,
        size: this.coffeeSize
      }
    }
  }
  return ikhofi
}

// async function runConnection() {
//   try {
//     // connect client to the server
//     await client.connect();
//     // send a ping to confirm success
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You Connected successfully to MongoDb",
//     );
//   } finally {
//     // Ensure the client will close when finished or an error occurs
//     // I have to turn this off, it causes and error with the collection.watch
//     // client.close();
//   }
// }

module.exports = coffeeObject


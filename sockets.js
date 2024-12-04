module.exports = () => {
  const clientCollection = mongoClient.db("coffee_orders").collection("white_coffees");

  io.on("connection", (socket) => {
    const changeStream = clientCollection.watch();

    changeStream.on("insert", (change) => {
      const order = JSON.stringify(change.fullDocument);
      socket.broadcast.emit("new order", order);

      // Simulate order status updates
      //   const statuses = ["Order Placed", "Preparing", "Ready for Pickup", "Picked Up"];
      //   let index = 0;

      //   const interval = setInterval(async () => {
      //     if (index >= statuses.length) {
      //       clearInterval(interval);
      //       return;
      //     }

      //     const newStatus = statuses[index];
      //     const updated = await clientCollection.updateOne(
      //       { _id: order._id },
      //       { $set: { status: newStatus } }
      //     );

      //     if (updated.modifiedCount > 0) {
      //       io.emit("order status update", { orderId: order._id, status: newStatus });
      //     }
      //     index++;
      //   }, 5000); // Update status every 5 seconds
    });

    // socket.on("update status", async (data) => {
    //   const updated = await clientCollection.updateOne(
    //     { _id: new mongoose.Types.ObjectId(orderId) },
    //     { $set: { status: newStatus } }
    //   );

    //   if (updated.modifiedCount > 0) {
    //     socket.broadcast.emit("order status update", { orderId, status: newStatus });
    //   } else {
    //     console.error(`Failed to update order ${orderId}`);
    //   }
    // });

    socket.on("order complete", (data) => {
      socket.emit("update", data);
    });

    socket.on("disconnect", () => {
      console.log("Websocket disconnected");
    });
  });
};

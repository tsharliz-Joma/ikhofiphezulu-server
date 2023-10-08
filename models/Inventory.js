const mongoose = require("mongoose");

const MilkInventorySchema = new mongoose.Schema({
    Type: {
        type: String,
        required: true
    },
    Quantity: {
        type: Number,
        required: false
    }
})

const MilkInventory = mongoose.model("milk-inventory", MilkInventorySchema);

module.exports =  MilkInventory;

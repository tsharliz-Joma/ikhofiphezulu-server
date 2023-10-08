const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    pwd: {
        type: String, 
        required: true
    }
}, { collection: "administrators" });


const Admin = mongoose.model("admin", AdminSchema );

module.exports = Admin;
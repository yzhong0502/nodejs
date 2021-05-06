const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let ordersModel = new Schema({
    name:String,
    address: String,
    email: String,
    orders:[String],
    date: {type:Date, default: Date.now}
})

module.exports = mongoose.model('order', ordersModel,'orderList');

const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let ordersModel = new Schema({
    username:{type:String, required:true, unique:true},
    password: {type:String, required:true},
    type: {type:String, required:true}
})

module.exports = mongoose.model('user', ordersModel,'userList');

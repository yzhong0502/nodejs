const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let productModel = new Schema({
    id:{type:String, required:true, unique:true},
    product: {type:String, required:true},
    data: String,
    price: {type:Number, required:true, min:0}
})

module.exports = mongoose.model('product', productModel,'productList');

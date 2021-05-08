const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let bugModel = new Schema({
    title:String,
    description: String,
    date: {type:Date, default: Date.now},
    assignee: String
})

module.exports = mongoose.model('bug', bugModel,'bugList');

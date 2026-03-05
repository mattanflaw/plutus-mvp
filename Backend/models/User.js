const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

userId:{
type:String,
required:true,
unique:true
},

telegramId:{
type:String,
default:null
},

username:{
type:String,
default:null
},

xp:{
type:Number,
default:0
},

balance:{
type:Number,
default:0
},

level:{
type:Number,
default:1
},

lastRewardTime:{
type:Number,
default:0
}

});

module.exports = mongoose.model("User",UserSchema);
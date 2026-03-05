const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

/*
===========================
PLUTUS TRUST SECURITY LAYER
===========================
*/

/* MongoDB Connection */

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
console.log("Plutus MongoDB Connected");
})
.catch(err=>{
console.log(err);
});

/* Secure Hash Generator */

function generateUserKey(userId){
return crypto
.createHash("sha256")
.update(userId + process.env.SECRET_KEY || "plutus_secure")
.digest("hex");
}

/* Anti Spam System */

const requestTracker = {};

function antiSpam(userId){

let now = Date.now();

if(!requestTracker[userId]){
requestTracker[userId]=[];
}

requestTracker[userId].push(now);

requestTracker[userId]=requestTracker[userId].slice(-10);

if(
requestTracker[userId].length >= 8 &&
now - requestTracker[userId][0] < 5000
){
return false;
}

return true;
}

/*
===========================
TRUST XP UPDATE
===========================
*/

app.post("/api/xp/update", async (req,res)=>{

let { userId, xpDelta } = req.body;

if(!userId) return res.status(400).send("Invalid User");

if(!antiSpam(userId)){
return res.status(429).send("Spam detected");
}

let user = await User.findOne({userId});

if(!user){
user = await User.create({userId});
}

let now = Date.now();

if(now - user.lastRewardTime < 60000){
return res.status(403).send("Reward cooldown");
}

user.xp += xpDelta;
user.lastRewardTime = now;

await user.save();

return res.json(user);
});

/*
===========================
TRUST WALLET UPDATE
===========================
*/

app.post("/api/wallet/update", async (req,res)=>{

let { userId, amount } = req.body;

if(!userId) return res.status(400).send("Invalid User");

if(!antiSpam(userId)){
return res.status(429).send("Spam detected");
}

let user = await User.findOne({userId});

if(!user){
user = await User.create({userId});
}

user.balance += amount;

await user.save();

return res.json(user);
});

/*
===========================
SERVER START
===========================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("PLUTUS TRUST SECURITY LAYER ACTIVE");
});
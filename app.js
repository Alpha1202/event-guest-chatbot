const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const config = require('./config')

// an instance of express
const app = express();

// setup database schema
let MessageSchema = new mongoose.Schema({
    phoneNumber: String,
    groupName: String,
    totalAdults: String,
    totalKids: String
})

// create the message model
let Message = mongoose.model('Message', MessageSchema);

// setup twilio config
const accountSid = config.accountSid;
const authToken = config.authToken;
const client = new twilio(accountSid, authToken);

// configure app to use bodyparser
app.use(bodyParser.urlencoded({ extended: false }))



// connect to database
mongoose.connect(config.uri, { useNewUrlParser: true }).then(() => {
    console.log('db connected');
}).catch(err => {
    console.log(err);
    process.exit()
})

// setup an intial route
app.get('/', (req, res) => {
    res.end();
})

// setup app's server
app.listen(3000, () => {
    console.log(`server connected`);
})
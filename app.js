const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const config = require('./config')

// an instance of express
const app = express();

// setup twilio config
const accountSid = 'ACb7eb2596b595ce7fef6f6186c5a70646';
const authToken = '47a5c3283121d8ea44bf843e928ad757';
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
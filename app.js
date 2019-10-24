const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const config = require('./config')

// connect to database
mongoose.connect(config.uri, { useNewUrlParser: true }).then(() => {
    console.log('db connected');
}).catch(err => {
    console.log(err);
    process.exit()
})

// setup database schema
let MessageSchema = new mongoose.Schema({
    phoneNumber: String,
    groupName: String,
    totalAdults: String,
    totalKids: String
})

// create the message model
let Message = mongoose.model('Message', MessageSchema);

// an instance of express
const app = express();

// setup twilio config
const accountSid = config.accountSid;
const authToken = config.authToken;
const client = new twilio(accountSid, authToken);

// configure app to use bodyparser
app.use(bodyParser.urlencoded({ extended: false }))





// setup an intial route
app.get('/', (req, res) => {
    res.end();
})

// setup endpoint to intercept incoming messages
app.post('/inbound', (req, res) => {

    const { From, To, Body} = req.body;
    let from = From;
    let to = To;
    let body = Body;

    Message.find({ phoneNumber: from }, (err, message) => {
        if(message.length !== 0) {
            // continue conversation
            if(!message[0].groupName && !message[0].totalAdults && !message[0].totalKids) {
                // here, find a given message by it's ID ad update it accordingly
                Message.findByIdAndUpdate(message[0]._id, {"$set": {"groupName": body}}, {"new": true, "upsert": true}, () => {
                    // after this update, the chatbot will ask the next question
                    client.messages.create({
                        to: `${from}`,
                        from: `${to}`,
                        body: 'How many adults are in your group?'
                    })
                    res.end();
                })
            } else if(!message[0].totalAdults && !message[0].totalKids) {
                // here, find a given message by it's ID ad update it accordingly
                Message.findByIdAndUpdate(message[0]._id, {"$set": {"totalAdults": body}}, {"new": true, "upsert": true}, () => {
                    // after this update, the chatbot will ask the next question
                    client.messages.create({
                        to: `${from}`,
                        from: `${to}`,
                        body: 'How many kids are in your group?'
                    })
                    res.end();
                })
            } else if(!message[0].totalKids) {
                // here, find a given message by it's ID ad update it accordingly
                Message.findByIdAndUpdate(message[0]._id, {"$set": {"totalKids": body}}, {"new": true, "upsert": true}, () => {
                    // after this update, the chatbot will ask the next question
                    client.messages.create({
                        to: `${from}`,
                        from: `${to}`,
                        body: 'Your are all set. Your spot has been reserved!'
                    })
                    res.end();
                })
            }
        } else {
            // start a new converstaion
            if(body === 'RSVP') {
                let newMessage = new Message();
                newMessage.phoneNumber = from;
                // save the new message object
                newMessage.save(() => {
                    // this makes the chatbot to respond
                    client.messages.create({
                        to: `${from}`,
                        from: `${to}`,
                        body: 'What is your group name?'
                    })
                    res.end();
                })
            }
        }

        res.end()
    })
})

// setup app's server
app.listen(3000, () => {
    console.log(`server connected`);
})
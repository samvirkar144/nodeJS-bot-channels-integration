/**
 * Copyright (c) 2017 Geraldo A. Perez
 */
'use strict'

 /**
  * NodeJS module - Enables to use express functions
  */
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN;
const APIAI_LANG = process.env.APIAI_LANG || 'en';

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN

const FacebookBot = require('./facebookbot');
const FacebookBotConfig = require('./facebookbotconfig');

const botConfig = new FacebookBotConfig(APIAI_ACCESS_TOKEN, APIAI_LANG);
const bot = new FacebookBot(botConfig);

const app = express(); // initialization for better readability of the code

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// process application/json
app.use(bodyParser.json())

// respond with message when a GET request is made to the homepage 
app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'}); // Setting content type for head
    res.end('This is the main page of the bot api!');
})

// respond with validation when a GET request is made to the webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
            res.send(req.query['hub.challenge']);
    }
    else {
        res.sendStatus(400);
    }
})

// respond with the message when a POST request is made to the webhook
app.post('/webhook', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id
	    if (event.message && event.message.text) {
		    let text = event.message.text
		    bot.sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200), FB_PAGE_ACCESS_TOKEN)
	    }
    }
    res.sendStatus(200)
})

// [TEST] logs the port and writes to console
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
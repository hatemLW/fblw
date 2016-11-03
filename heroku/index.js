/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
*/

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  console.log(req);
  res.send('It works!!!');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == 'token'
  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  } 
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:');

  if (req.isXHub) {
    console.log('request header X-Hub-Signature found, validating');
    if (req.isXHubValid()) {
      console.log('request header X-Hub-Signature validated');
      res.send('Verified!\n');
    }
  }
  else {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.send('Failed to verify!\n');
    // recommend sending 401 status in production for non-validated signatures
    // res.sendStatus(401);
  }
  console.log(req.body);
  
  
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            // Your Logic Replaces the following Line
            sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200),req);
        }
    }
    

  // Process the Facebook updates here
  res.sendStatus(200);
});

function sendTextMessage(sender, text,request) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:app.get('page_access_token')},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.listen();

/*
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.set('verify_token', (process.env.VERIFY_TOKEN || 'TEST'));
app.set('page_access_token', (process.env.PAGE_ACCESS_TOKEN || 'NULL'));

app.get('/', function (req, res) {
        res.send('It Works! Follow FB Instructions to activate.');
});

app.get('/facebook', function (req, res) {
    if (req.query['hub.verify_token'] === app.get('verify_token')) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/facebook/', function (req, res) {
    console.log (req.body);
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            // Your Logic Replaces the following Line
            sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
        }
    }
    res.sendStatus(200);
});

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:app.get('page_access_token')},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});*/

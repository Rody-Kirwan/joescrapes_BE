const express     = require('express');
const	bodyParser  = require('body-parser');
const	morgan      = require('morgan');
const mongoose    = require('mongoose');
const	uriUtil     = require('mongodb-uri');
const	config      = require('./config');
const pythonShell = require('python-shell');
const fs          = require('fs');
const authorize = require('./authorize').auth;

const googleapis = require('googleapis');
const { google } = googleapis;
// const	apiRoutes  = require('./routes/index');


const app = express();
const http = require('http').Server(app);


// Setup Server
app.use((req, res, next) => {
  const responseHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:3200',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, accept, Authorization, Content-Length, X-Requested-With, token, x-access-token',
    'Access-Control-Allow-Credentials': 'true'
  } 
  res.header({ ...responseHeaders });
  
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

app.use(bodyParser.json());
app.use(morgan('dev'));

app.set('superSecret', config.secret);

app.get('/', function(req, res){
  res.send('server is running on http://localhost:8000')
});

app.post('/api/calendar/add', (req, res) => {
  console.log(req.body)
  const scheduleData = {
    title: "Ganas – Mas Exitos con Ganas",
    month: "April 2018",
    link: "http://dublab.com/events/63539/live-broadcast-ganas/",
    time: "12:00 PM - 02:00 PM",
    date: "1",
    day: "Sun",
    user: "rody.kirwan@gmail.com"
    // invites: [{
    //   email: 'joseftugwell@gmail.com'
    // },
    // {
    //   email: 'davittconroy@gmail.com'
    // }]
  };
  
  const event = {
    summary: scheduleData.title,
    location: scheduleData.link,
    description: 'Daecent wibbly wobbly trouser-tech and sponge-bass-electracore',
    start: {
      dateTime: '2018-05-19T09:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2018-05-20T17:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    recurrence: [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    attendees:  scheduleData.invites,
    reminders: {
      useDefault: false,
      overrides: [
        {method: 'email', minutes: 10},
        {method: 'popup', minutes: 10},
      ]
    }
  };



  const listEvents = (auth) => {
    console.log('callback >>>>>>>>>>>>>>>>')
    const calendar = google.calendar({version: 'v3', auth});
    
    calendar.events.insert({
      auth: auth,
      calendarId: 'primary',
      resource: event,
    }, function(err, event) {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
      console.log('Event created: %s', event.htmlLink);
    });
  }

  

  fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), listEvents);
  });


  res.send({
    success: true,
    message: 'Endpoint Hit'
  })

})

const port = process.env.PORT || 8000;

http.listen(port);
console.log(`listening at port ${port}`)

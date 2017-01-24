const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const routes = require('./routes');


// mongoose.connect('mongodb://localhost/hacker-news');

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'build')));
}

app.use('/', routes);

// Catch everything that isn't in routes and send
// to client so react-router can handle it
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

io.on('connection', client => {
  client.on('event', data => {
    console.log(data);
  });
  client.on('disconnect', () => {
    console.log('disconnected');
  });
  client.on('eat', data => {
    console.log("somthing was eaten", data);
    io.emit('eat', data);
  });
  client.on('move', data => {
    console.log("player moved", data);
    io.emit('move', data);
  })
});

module.exports = server;
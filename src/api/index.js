var express = require('express');

var app = express.Router();

app.use(function (req, res, next) {
  res.send('api server');
});

module.exports = app;
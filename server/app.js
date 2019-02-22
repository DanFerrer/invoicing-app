const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        type: 'error',
        message: err.message
    });
});

module.exports = app;




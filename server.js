"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const redis = require("redis");
const passport = require("passport");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const session = require("express-session");
const validator = require("express-validator");
const favicon = require("serve-favicon");
const path = require("path");

const logger = require("./utils/logger");

const app = express();
const port = process.env.PORT || 9999;

// Ejs templates
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Working dir
app.use(express.static(path.resolve(__dirname, "static")));
app.use(favicon(path.join(__dirname, 'static/images/favicons', 'logo.png')))
app.use('/modules', express.static(__dirname + '/node_modules/'));

// Passport authentication and sessions
app.use(
    session({
        secret: "kensentme",
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 28800000 }, // 28800000 = 8 hours * 3 * 14 = 14 days
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//app.use(validator());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    morgan(
        ":date :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
    )
);

// Routes
const router = require("./app/routes");
app.use(router);

// Socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server, { pingTimeout: 60000 });
require("./app/controllers/socketcontroller")(io);

// Launch app - Normally this would be app.listen(...), but since we're using socket.io, it is server.listen(...)
server.listen(port, function () {
    // In production run: LOG_LEVEL=info node server.js
    logger.info("(.)(.) server.js started on port " + port + " (.)(.)");
});

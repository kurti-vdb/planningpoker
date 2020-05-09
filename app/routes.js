"use strict";

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');


router.get("/", function (req, res) {
    res.render("index", {
        title: "Planning poker",
        year: new Date().getFullYear(),
    });
});

router.post("/room", function (req, res) {

    let role = "voter";

    if (req.body["moderator"] == "on")
        role = "moderator";

    let user = {
        uid: uuidv4(),
        name: req.body.username,
        avatar: "avatar-" + (Math.floor(Math.random() * 28) + 1) + ".jpg",
        city: req.body.city,
        country: req.body.country,
        role: role,
        voted: false
    };

    res.render("room", {
        title: "Planning poker",
        year: new Date().getFullYear(),
        user: user
    });
});


module.exports = router;

const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const fs = require('node:fs');
const path = require('node:path');
const { request } = require('undici');
const config = require('../config.js');
const app = express();
const router = express.Router();

module.exports = async (client) => {
    app.use(express.static(path.join(__dirname + "/pages")));
    app.use(bodyParser.urlencoded({ extended: true }))

    app.set("view engine", "pug");
    app.set("views", express.static(path.join(__dirname, "/pages")));

    router.get("/", async (req, res) => {
        if (res.statusCode === 404)
            return res.sendFile(__dirname + "/pages/404.html")
        res.render("index");
    });

    router.get("/commands", (req, res) => {
        res.sendFile(__dirname + "/pages/commands.html")
    });

    app.use("/", router);

    app.listen(8080, () => {
        console.log("Application started and Listening on port 8000");
    });

}

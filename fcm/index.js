const LastMovieModel = require("../models/LastMovie");
const UserModel = require("../models/User");
const firebase = require("firebase-admin");

const dbUrl = "https://chat-143ce-default-rtdb.firebaseio.com";
const axios = require("axios")
const {fetchAndSaveNewMovies} = require("./services");
require('dotenv').config();

const firebaseInit = firebase.initializeApp({
    credential: firebase.credential.cert({
        type: "service_account",
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.CLIENT_URL,
        universe_domain: "googleapis.com"
    }),
    databaseURL: dbUrl,
}, 'filmer');


module.exports = {firebaseInit};

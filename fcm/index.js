
const LastMovieModel = require("../models/LastMovie");
const UserModel = require("../models/User");
const firebase = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json")
const dbUrl = "https://filmer-98352-default-rtdb.firebaseio.com";
const axios = require("axios")
const {fetchAndSaveNewMovies} = require("./services");


const firebaseInit = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: dbUrl,
}, 'filmer');


module.exports = {firebaseInit};

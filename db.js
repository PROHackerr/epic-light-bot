
var firebase = require('firebase');

var firebaseConfig = JSON.parse(process.env.FIREBASE_DB_CONFIG);
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

exports.db = firebase.database();

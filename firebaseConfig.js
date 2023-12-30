var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://grocery-delivery-287ce-default-rtdb.firebaseio.com',
});

module.exports = firebaseAdmin;

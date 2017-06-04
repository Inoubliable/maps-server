var firebase = require('firebase');

try {
	var config = {
		apiKey: "AIzaSyDkA4ADBe9iDhdATPQuW5VXqDdTk7NPejM",
	    authDomain: "mapstest-822da.firebaseapp.com",
	    databaseURL: "https://mapstest-822da.firebaseio.com",
	    projectId: "mapstest-822da",
	    storageBucket: "mapstest-822da.appspot.com",
	    messagingSenderId: "429993691226"
	};
	firebase.initializeApp(config);
} catch(e) {

}

module.exports = firebase;
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var bodyParser = require('body-parser')
var io = require('socket.io')(http);

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

// Firebase
var db = require('./config/database');
var firebase = db.database();

app.get('/users', (req, res) => {
	var usersRef = firebase.ref().child('users');

	usersRef.once('value').then((snapshot) => {
		var users = snapshot.val() || {};
		var keys = Object.keys(users);
		var parsedUsers = [];
		var lastUser;
		keys.forEach((key) => {
			parsedUsers.push(users[key]);
			lastUser = parsedUsers.slice(-1)[0];
			lastUser.id = key;
		});

		res.json(parsedUsers);
	});
});
app.get('/users/:id', (req, res) => {
	var userId = req.params.id;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var usersRef = firebase.ref('users/' + userId).update({ lat: lat, lng: lng });

	res.end();
});

// adding users for testing
var testLat = 23;
var testLng = 12;
app.get('/add', (req, res) => {
	var newUserRef = firebase.ref().child('users').push();
	newUserRef.set({
		lat: testLat,
		lng: testLng
	});

	testLat++;
	testLng++;

	res.end();
});

io.on('connection', onConnection);

function onConnection(socket) {
	// insert new user into db
	var newUserRef = firebase.ref().child('users').push();
	newUserRef.set({
		lat: 0,
		lng: 0
	});

	// send him his id
	console.log(newUserRef.key);
	io.to(socket.id).emit('my id', newUserRef.key);
};

setInterval(function() {
	var usersRef = firebase.ref().child('users');

	usersRef.once('value').then((snapshot) => {
		var users = snapshot.val() || {};
		var keys = Object.keys(users);
		var parsedUsers = [];
		var lastUser;
		keys.forEach((key) => {
			parsedUsers.push(users[key]);
			lastUser = parsedUsers.slice(-1)[0];
			lastUser.id = key;
		});

		io.emit('update', {users: users});
	});
	
}, 5000);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
	console.log('I am up on 3000');
});
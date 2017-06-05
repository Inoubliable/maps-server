var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var bodyParser = require('body-parser')

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

// Firebase
var db = require('./config/database');
var firebase = db.database();

app.get('/login', (req, res) => {
	// insert new user into db
	var newUserRef = firebase.ref().child('users').push();
	newUserRef.set({
		lat: 0,
		lng: 0
	});

	// send him his id
	res.json({id: newUserRef.key});
});

app.get('/users', (req, res) => {
	// if all query params are specified, return users within range
	if(req.query.lat && req.query.lng && req.query.r) {
		var centerLat = parseFloat(req.query.lat);
		var centerLng = parseFloat(req.query.lng);
		var r = parseFloat(req.query.r);
		var minLat = centerLat - r;
		var maxLat = centerLat + r;
		var minLng = centerLng - r;
		var maxLng = centerLng + r;

		var usersRef = firebase.ref().child('users');
		usersRef.on('value', (snapshot) => {
			var users = snapshot.val() || {};
			var keys = Object.keys(users);
			var parsedUsers = [];
			var lastUser;
			keys.forEach((key) => {
				if(users[key].lat <= maxLat 
					&& users[key].lat >= minLat 
					&& users[key].lng <= maxLng 
					&& users[key].lng >= minLng) {

					parsedUsers.push(users[key]);
					lastUser = parsedUsers.slice(-1)[0];
					lastUser.id = key;
				}
			});

			res.json(parsedUsers);
		});
	} else { // if not all query params are specified, return all users
		var usersRef = firebase.ref().child('users');
		usersRef.on('value', (snapshot) => {
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
	}
});

app.get('/users/:id', (req, res) => {
	var userId = req.params.id;
	var userRef = firebase.ref('users/' + userId);

	userRef.once('value').then((snapshot) => {
		var user = snapshot.val() || {};

		res.json(user);
	});
});

app.post('/users/:id', (req, res) => {
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
		lng: testLng,
		time: Date.now()
	});

	testLat++;
	testLng++;

	res.end();
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
	console.log('I am up on 3000');
});
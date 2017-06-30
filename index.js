var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

// Firebase
var db = require('./config/database');
var firebase = db.database();

app.post('/login', (req, res) => {
	var lat = parseFloat(req.body.lat);
	var lng = parseFloat(req.body.lng);
	// insert new user into db
	var newUserRef = firebase.ref().child('users').push();
	newUserRef.set({
		lat: lat,
		lng: lng,
		time: Date.now()
	});

	// send him his id
	res.json({id: newUserRef.key});
});

app.get('/users', (req, res) => {

	var parsedUsers = [];

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
		});
		
		res.json(parsedUsers);
	} else {
		var usersRef = firebase.ref().child('users');
		usersRef.on('value', (snapshot) => {
			var users = snapshot.val() || {};
			var keys = Object.keys(users);
			var lastUser;
			keys.forEach((key) => {
				parsedUsers.push(users[key]);
				lastUser = parsedUsers.slice(-1)[0];
				lastUser.id = key;
			});
		});
		
		res.json(parsedUsers);
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
	var lat = parseFloat(req.body.lat);
	var lng = parseFloat(req.body.lng);
	firebase.ref('users/' + userId).update({ lat: lat, lng: lng });

	res.end();
});

app.delete('/users/:id', (req, res) => {
	var userId = req.params.id;
	firebase.ref('users/' + userId).remove();

	res.end();
});

var allParkings = {
	"Petkovškovo nabrežje II.": {lat: 46.0521351, lng: 14.5093453, all: 0, available: 0},
	"NUK II.": {lat: 46.0463566, lng: 14.5017598, all: 0, available: 0},
	"Senatorij Emona": {lat: 46.0535596, lng: 14.5064339, all: 0, available: 0},
	"Bežigrad": {lat: 46.0625096, lng: 14.5060959, all: 0, available: 0},
	"Mirje": {lat: 46.0466615, lng: 14.4921755, all: 0, available: 0},
	"Trg MDB": {lat: 46.0469197, lng: 14.4935305, all: 0, available: 0},
	"Tivoli I.": {lat: 46.0576398, lng: 14.4968741, all: 0, available: 0},
	"Tivoli II.": {lat: 46.060125, lng: 14.4950341, all: 0, available: 0},
	"Žale I.": {lat: 46.0689395, lng: 14.5267334, all: 0, available: 0},
	"Žale II.": {lat: 46.0676294, lng: 14.527463, all: 0, available: 0},
	"Žale III. - Soča": {lat: 46.0682057, lng: 14.5236963, all: 0, available: 0},
	"Žale IV.": {lat: 46.0695067, lng: 14.5248611, all: 0, available: 0},
	"Trg prekomorskih brigad": {lat: 46.0691515, lng: 14.4872436, all: 0, available: 0},
	"Kranjčeva (Pop TV)": {lat: 46.0702222, lng: 14.5199124, all: 0, available: 0},
	"Štembalova ulica": {lat: 46.0808662, lng: 14.5105652, all: 0, available: 0},
	"Gosarjeva ulica": {lat: 46.0746331, lng: 14.513012, all: 0, available: 0},
	"Gosarjeva ulica II.": {lat: 46.0740417, lng: 14.5153521, all: 0, available: 0},
	"Kozolec": {lat: 46.0567934, lng: 14.5027459, all: 0, available: 0},
	"Kongresni trg": {lat: 46.0506341, lng: 14.501298, all: 0, available: 0},
	"PH Kolezija": {lat: 46.0423455, lng: 14.4926678, all: 0, available: 0},
	"Center Stožice": {lat: 46.0793676, lng: 14.5221019, all: 0, available: 0},
	"Gospodarsko razstavišče": {lat: 46.0618602, lng: 14.5079083, all: 0, available: 0},
	"Gospodarsko razstavišče - Abonenti": {lat: 46.0618602, lng: 14.5079083, all: 0, available: 0},
	"Linhartova": {lat: 46.0632226, lng: 14.5077204, all: 0, available: 0},
	"P+R Studenec": {lat: 46.0541576, lng: 14.5652754, all: 0, available: 0},
	"P+R Dolgi Most": {lat: 46.0365865, lng: 14.4611001, all: 0, available: 0},
	"P+R Barje": {lat: 46.0270564, lng: 14.4982871, all: 0, available: 0},
	"Območja čas. om. park.": {lat: 0, lng: 0, all: 0, available: 0}
};
var formattedParkings = [];

function scrapeParkings(callback) {
	var parkiriscaUrl = 'http://www.lpt.si/parkirisca/parkirisca';

	request(parkiriscaUrl, function(error, response, html){

        if(!error){
			formattedParkings = [];

            var $ = cheerio.load(html);
            var parkirisca = $('tr.table_list');
            var name, all, available;

            parkirisca.each(function() {
            	name = $(this).find('.occupancy_name_td').text();
            	all = parseInt($(this).find('.occupancy_daily:nth-child(3) .occupancy_td').text());
            	available = parseInt($(this).find('.occupancy_daily:nth-child(4) .occupancy_td').text());

            	if(!available) {
            		available = 0;
            	}

            	allParkings[name].all = all;
            	allParkings[name].available = available;
            });

			var names = Object.keys(allParkings);
			var lastParking;
			names.forEach((name) => {
				formattedParkings.push(allParkings[name]);
				lastParking = formattedParkings.slice(-1)[0];
				lastParking.name = name;
			});
        }

        callback();
    });
};

app.get('/parkings', (req, res) => {

	scrapeParkings(function() {
		res.json(formattedParkings);
	});

});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
	console.log('I am up on 3000');
});
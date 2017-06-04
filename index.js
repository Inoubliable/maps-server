var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.json(users);
});
app.post('/', (req, res) => {
	res.send('Success');
});

io.on('connection', onConnection);

function onConnection(socket) {
	// send him all users
	io.to(socket.id).emit('users', users);
}

setInterval(function() {
	io.emit('update', {users: users});
}, 5000);

http.listen(PORT, () => {
	console.log('I am up on 3000');
});
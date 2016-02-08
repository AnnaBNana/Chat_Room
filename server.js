var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require('body-parser');
var allChat = [];
var users = [];

app.use(express.static('views'));
app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
 res.render("index");
});

var server = app.listen(6789, function() {
 console.log("listening on port 6789");
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log("SERVER::WE ARE USING SOCKETS!");
  // console.log(socket.id);

  socket.on("message", function(data) {
  	// console.log(data);
  	var name = data.name;
  	var message = data.message;
    allChat.push(name + ": " + message);
  	io.emit("newMessage", data);
  })

  socket.on("requestMessages", function(data) {
    // console.log(socket.id);
    // console.log(data);
    var user = {};
    user["name"] = data.name;
    user["id"] = socket.id;
    users.push(user);
    console.log(users);
    var prevData = {};
    prevData["message"] = allChat;
    var allUsers = {};
    allUsers["users"] = users;
    socket.emit("returnMessages", prevData);
    io.emit("returnUsers", allUsers)
  })

  socket.on("disconnect", function() {
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === socket.id) {
        users.splice(i, 1);
      }
    }
    io.emit("updateUsers", users);
  })

});

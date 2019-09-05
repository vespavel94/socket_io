var app = require('express')()
var server = require('http').createServer(app)
var bodyParser = require('body-parser')
var io = require('socket.io')(server)
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var users = []
var connections = []
var messages = []
var currUser = ''

// -----------LOGIN--------------------------------------

app.get('/login', urlencodedParser, function (request, response) {
  response.sendFile(__dirname + '/login.html')
})

app.post('/login', urlencodedParser, function(request, response) {
  console.log(request.body.name)
  currUser = request.body.name
  response.send('got username')
})

//----------------MAIN-----------------------------------------------

app.get('/', urlencodedParser, function (request, response) {
  response.sendFile(__dirname + '/index.html')
})

app.post('/getname', urlencodedParser, function (request, response){
  console.log(request.body)
  response.send({ name: currUser })
})

io.sockets.on('connection', function(socket) {
  io.sockets.emit('render messages', messages)
  console.log('connected succesfully')
  connections.push(socket)
  
  socket.on('disconnect', function(data) {
    connections.splice(connections.indexOf(socket), 1)
    console.log('user Disconnected')
  })

  socket.on('send mess', function(data) {
    messages.push(data)
    io.sockets.emit('add mess', {
      msg: data
    })
  })

  socket.on('reset chat', function() {
    messages = []
    io.sockets.emit('reset')
    console.log(messages)
  })
})

server.listen(3030)
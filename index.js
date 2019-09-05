var app = require('express')()
var server = require('http').createServer(app)
var bodyParser = require('body-parser')
var io = require('socket.io')(server)
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var users = []
var connections = []
var messages = []
var currUser = ''

// -----------LOGIN-AJAX-------------------------------------

app.get('/login', urlencodedParser, function (request, response) {
  response.sendFile(__dirname + '/login.html')
})

app.post('/login', urlencodedParser, function(request, response) {
  console.log(request.body.name)
  currUser = request.body.name
  response.send('got username')
})

//----------------MAIN-AJAX----------------------------------------------

app.get('/', urlencodedParser, function (request, response) {
  response.sendFile(__dirname + '/index.html')
})

app.post('/getname', urlencodedParser, function (request, response){
  console.log(request.body)
  response.send({ name: currUser })
})

//-------------------ADMIN-AJAX-----------------------------------------

app.get('/admin', urlencodedParser, function(request, response) {
  response.sendFile(__dirname + '/admin.html')
})

app.get('/admindata', urlencodedParser, function(request, response) {
  response.send({ users: users })
})

//--------------SOCKETS-----------------------------------------------

io.sockets.on('connection', function(socket) {
  connections.push(socket)
  socket.on('join', function(data) {
    if (!users.includes(data.username)) {
      users.push(data.username)
    }
    socket.join(data.username)
    console.log(`User ${data.username} connected`)
  })

  socket.on('adminMessage', function(data){
    io.sockets.in(data.reciever).emit('admin says', { message: data.message })
  })
})

// io.sockets.on('connection', function(socket) {
//   io.sockets.emit('render messages', messages)
//   console.log('connected succesfully')
//   connections.push(socket)
  
//   socket.on('disconnect', function(data) {
//     connections.splice(connections.indexOf(socket), 1)
//     console.log('user Disconnected')
//   })

//   socket.on('send mess', function(data) {
//     messages.push(data)
//     io.sockets.emit('add mess', {
//       msg: data
//     })
//   })

//   socket.on('reset chat', function() {
//     messages = []
//     io.sockets.emit('reset')
//     console.log(messages)
//   })
// })

server.listen(3030)
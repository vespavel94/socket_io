var app = require('express')()
var server = require('http').createServer(app)
var bodyParser = require('body-parser')
var io = require('socket.io')(server)
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var users = []
var connections = []
var messages = []
var currUser = ''
var adminSocket = null

function Client (name) {
  this.name = name,
  this.cash = 5000
}

Client.prototype.sendCash = function () {
  io.in(this.name).emit('send cash', this.cash)
}

Client.prototype.changeCash = function (val) {
  this.cash += val
  this.sendCash()
}

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
    if (data.username === 'admin') {
      adminSocket = socket
      adminSocketInit()
      console.log(adminSocket.id)
    } else {
      if (!users.find(x => x.name === data.username)) {
        users.push(new Client(data.username))
      }
      socket.join(data.username)
      console.log(`User ${data.username} connected`)
      io.in(data.username).emit('admin says', { message: `Hello, ${data.username}` })
      users.find(x => x.name === data.username).sendCash()
    }
  })
})

setInterval(() => {
  io.sockets.emit('update-time', { time: new Date().toTimeString().split(' ')[0] })
}, 1000);

function adminSocketInit () {
  adminSocket.on('adminMessage', function(data) {
    io.in(data.reciever).emit('admin says', { message: data.message })
  })
  adminSocket.on('change cash', function(data) {
    console.log(data)
    users.find(x => x.name === data.name).cash += data.change
    users.find(x => x.name === data.name).sendCash()
  })
}

server.listen(3030)
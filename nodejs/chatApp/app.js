const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 3000;

app.use(express.static(__dirname+'/public'));

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

io.on('connection',(socket)=>{
    socket.on('chat message', (nickname, msg, time) => {
        io.emit('chat message', nickname, msg, time);
    });
})


server.listen(port, () => {
    console.log('listening on *: '+port);
});

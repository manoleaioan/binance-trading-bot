const server = require('http').createServer();

const io = require('socket.io')(server, {
  transport: ['websocket', 'polling']
});

const userServer = (bot, port) =>{
  io.on('connection', client => {
    bot.setSocketClient(client);
  });
  
  server.listen(port);
  console.log(`Server listening on ${port}`);
} 

module.exports = userServer;
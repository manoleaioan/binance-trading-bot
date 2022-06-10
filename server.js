const server = require('http').createServer();

const userServer = (bot, port) =>{
  io.on('connection', client => {
    bot.setSocketClient(client);
  });
  
  server.listen(port);
  console.log(`Server listening on ${port}`);
} 

module.exports = userServer;
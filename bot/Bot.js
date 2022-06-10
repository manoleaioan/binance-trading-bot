const { strategyInfiniteValue } = require('../strategies');

class Bot {
  constructor(client) {
    this.client = client;
    this.strategyInfiniteValue = args => strategyInfiniteValue({
      bot: this,
      ...args
    })
  }

  setSocketClient(socket) {
    this.socketClient = socket;
  }

  onData(data) {
  }
}

module.exports = Bot;
const API = require('./API');
const WebSocket = require('ws');

class Client extends (API) {
  constructor(apiKey = '', apiSecret = '', options = {}) {
    options.baseURL = options.baseURL || 'https://api.binance.com'
    super({
      apiKey,
      apiSecret,
      ...options
    })
  }

  async balances() {
    const { data } = await this.signRequest({}, '/api/v3/account', 'GET')
    const balances = (data.balances).filter(a => a.free > 0);
    return balances;
  }

  async getCurrentPrice(symbol) {
    const { data } = await this.publicRequest({}, '/api/v3/ticker/price', 'GET')
    const price = (data).find(a => a.symbol.toLowerCase() == symbol.toLowerCase());
    return price.price;
  }

  async allOrders(symbol) {
    const { data } = await this.signRequest({
      symbol
    }, '/api/v3/allOrders', 'GET')
    return data;
  }

  async trade({ side, symbol, quantity, test = false, type = 'MARKET', timeInForce, price = 0 }) {
    const response = await this.signRequest({
      side,
      symbol,
      quantity,
      type,
      ...(type.toLocaleUpperCase() === "LIMIT" && {
        timeInForce,
        price,
      }),
      recvWindow: 5000
    }, '/api/v3/order' + (test ? "/test" : ''), 'POST');
    return response;
  }

  tradeWs(symbol) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`);

    ws.on('ping', () => {
      ws.pong();
    });

    return ws;
  }
}

module.exports = Client;
const crypto = require('crypto');
const qs = require('qs');
const axios = require('axios');

class API {
  constructor(options) {
    const { apiKey, apiSecret, baseURL } = options;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = baseURL || 'https://api.binance.com';
  };

  async getTime() {
    let { data } = await axios.get(`${this.baseURL}/api/v3/time`);
    return data.serverTime
  };

  buildSign(queryString) {
    return crypto.
      createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  };

  async publicRequest(data, endPoint, method) {
    const requestConfig = {
      method,
      url: this.baseURL + endPoint,
      headers: {
        'Content-Type': 'application/json'
      },
    };

    try {
      const response = await axios(requestConfig);
      return response;
    }
    catch (err) {
      throw err.response.data;
    }
  };

  async signRequest(data, endPoint, method) {
    data.timestamp = await this.getTime();
    const dataQueryString = qs.stringify(data);
    const signature = this.buildSign(dataQueryString);
    const requestConfig = {
      method,
      url: this.baseURL + endPoint + '?' + dataQueryString + '&signature=' + signature,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      },
    };

    try {
      const response = await axios(requestConfig);
      return response;
    }
    catch (err) {
      throw err.response.data;
    }
  };
}

module.exports = API;
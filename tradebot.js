// require('dotenv').config();
// const userServer = require('./server');
const axios = require('axios');
const fs = require('fs');

let config = JSON.parse(fs.readFileSync('config.json'));
let strategyConfig = JSON.parse(fs.readFileSync('strategyConfig.json'));

const Client = require('./binanace/Client');
const Bot = require('./bot/Bot');

const client = new Client(config.API_KEY, config.API_SECRET);
const bot = new Bot(client);

async function connect() {
  try {
    let balances = await client.balances();
    console.log(balances);
    bot.strategyInfiniteValue({ ...strategyConfig, DISCORD_WEBHOOK: config.DISCORD_WEBHOOK })
  } catch (err) {
    console.log(err)
  }
}

console.log("Getting your balances...")
connect();

process.stdin.resume();
// userServer(bot, 3001);
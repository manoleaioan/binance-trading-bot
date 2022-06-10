const { default: axios } = require('axios');

function printCurrentPrice(symbol, price) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`\t[•] ${symbol}  :  ${price}`);
}

function sendEmbed({ symbol, side, price, qty, DISCORD_WEBHOOK, test, commission, commissionAsset }) {
  axios.post(DISCORD_WEBHOOK,
    {
      "username": "Binance",
      "avatar_url": "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency/512/Binance-Coin-icon.png",
      "embeds": [{
        "author": {
          "name": symbol.toUpperCase(),
          "icon_url": "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency/512/Binance-Coin-icon.png"
        },
        "color": side == "BUY" ? 5353475 : 16711680,
        "footer": {
          "text": "Trade Bot "
        },
        "timestamp": new Date(),
        "description": `**Side:   ${side}\nPrice:   ${price}\nQty:   ${qty}${!test ? "\nFee:   " + commission + " " + commissionAsset : ""}**`
      }]
    })
}


const strategyInfiniteValue = async ({
  symbol, price, buyOffset, sellOffset, buyQty, sellQty, stopLoss, repeat = 1, test = false,
  discordNotifications = false, side = "buy/sell", bot, DISCORD_WEBHOOK, spotType = "market", timeInForce }) => {

  let order;
  let sold = false;
  let bought = false;
  let values = [];
  let count = 1;
  let buyValue
  let sellValue;
  let stopLossValue;
  side = side.toLowerCase();

  let { client } = bot;

  let isDynamicPrice = (typeof price === 'string' || price instanceof String) && price.toUpperCase() == "MARKET";

  if (test) {
    console.log("\n<< TEST MODE >>")
  }
  console.log(`${!test ? "\n" : ''}Connecting to Market Stream...\n`)

  const socket = client.tradeWs(symbol);

  const calcValues = (sep = "", p) => {
    if (isDynamicPrice) {
      price = parseFloat(p);
    }

    buyValue = price + buyOffset / 100 * price;
    sellValue = price + sellOffset / 100 * price;
    stopLossValue = price + stopLoss / 100 * price;

    if (side != "sell") {
      console.log(`${sep}BUY  when ${symbol} <= price(${price}) ${buyOffset >= 0 ? '+' : ''}${buyOffset}% <= ${buyValue.toFixed(10)}`)
    }

    if (side != "buy") {
      console.log(`${(side != "buy/sell" && side != "sell/buy") ? sep : ''}SELL when ${symbol} >= price(${price}) ${sellOffset >= 0 ? '+' : ''}${sellOffset}% >= ${sellValue.toFixed(10)}`)
      if (isDynamicPrice) {
        console.log(`STOP LOSS ${stopLoss}% -> SELL when ${symbol} <= ${stopLossValue.toFixed(10)}`)
      }
    }
  }


  socket.onmessage = async function (event) {
    var data = JSON.parse(event.data);
    const { s, E, p } = data;
    values.push(p);

    if (!buyValue) {
      calcValues('', p);
    }

    bot.onData(data);

    printCurrentPrice(symbol, p, count, repeat);

    if (!bought && side != "sell" && !(count == 1 && side.toLowerCase() == "sell/buy")) {
      if (p <= buyValue) {
        try {
          bought = true;
          order = await client.trade({ side: 'BUY', symbol, quantity: buyQty, type: spotType, timeInForce, price: p, test });
          console.log(`\nBUY ${count}/${repeat}  `, test ? data : order.data);
          if (discordNotifications && DISCORD_WEBHOOK !== "") {
            sendEmbed({
              symbol,
              side: "BUY",
              price: test ? p : order.data.fills[0].price,
              commission: test ? '-' : order.data.fills[0].commission,
              commissionAsset: test ? '-' : order.data.fills[0].commissionAsset,
              qty: buyQty,
              DISCORD_WEBHOOK,
              test
            })
          }
          if (side == "buy") {
            if (count < repeat && isDynamicPrice) {
              calcValues('\n', p);
            }
            count++;
            if (count <= repeat) {
              order = undefined;
              sold = false;
              bought = false;
            } else {
              socket.close();
            }
          }
        } catch (err) {
          socket.close();
          console.log("\nerr", err);
        }
      }
    } else if ((order || side == "sell" || (side == "sell/buy" && count == 1)) && side != "buy") {
      if (!sold && (isDynamicPrice ? (p >= sellValue || p <= stopLossValue) : p >= sellValue)) {
        try {
          sold = true;
          const response = await client.trade({ side: 'SELL', symbol, quantity: sellQty, type: spotType, timeInForce, price: p, test });
          console.log(`\nSELL ${count}/${repeat}  `, test ? data : response.data);
          if (discordNotifications && DISCORD_WEBHOOK !== "") {
            sendEmbed({
              symbol,
              side: "SELL",
              price: test ? p : response.data.fills[0].price,
              commission: test ? '-' : response.data.fills[0].commission,
              commissionAsset: test ? '-' : response.data.fills[0].commissionAsset,
              qty: sellQty,
              DISCORD_WEBHOOK,
              test
            })
          }
          if (count < repeat && isDynamicPrice) {
            calcValues('\n', p);
          }
          count++;
          if (count <= repeat) {
            order = undefined;
            sold = false;
            bought = false;
          } else {
            socket.close();
          }
        } catch (err) {
          socket.close();
          console.log("\nerr", err);
        }
      }
    }

    if (values.length > 120) {
      values = values.slice(60);
    }
  }
}

module.exports = strategyInfiniteValue;
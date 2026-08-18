require("dotenv").config();

const http = require("http");
const axios = require("axios");
const { App } =
require("@slack/bolt");

const app = new App({
    token:
process.env.SLACK_BOT_TOKEN,
    appToken:
process.env.SLACK_APP_TOKEN,
    socketMode: true
});

// Respond when someone says "hello"
app.message("hello", async ({ message, say }) => {
  await say(`Hello <@${message.user}>!`);
});

app.command('/mybot-help', async ({ ack, respond }) => {
  await ack();

  await respond({
    response_type: 'ephemeral',
    text:
      '*🤖 MyBot Help Menu*\n\n' +
      'Here are the available commands:\n\n' +
      '• `/mybot-help` — Show this help menu\n' +
      '• `/mybot-weather` — Check the weather\n' +
      '• `/mybot-status` — Check bot status\n' +
      '• `/mybot-about` — About MyBot\n\n' +
      'More features coming soon! 🚀'
  });
});

app.command('/mybot-weather', async ({ command, ack, respond }) => {
  await ack();

  const city = command.text.trim();

  if (!city) {
    await respond({
      response_type: 'ephemeral',
      text: '🌦️ Please enter a city. Example: `/mybot-weather Delhi`'
    });
    return;
  }

  try {
    const response = await axios.get(
      'https://api.weatherstack.com/current',
      {
        params: {
          access_key: process.env.WEATHER_API_KEY,
          query: city
        }
      }
    );

    const data = response.data;

    if (data.error) {
      await respond({
        response_type: 'ephemeral',
        text: `❌ ${data.error.info || 'Unable to get weather.'}`
      });
      return;
    }

    await respond({
      response_type: 'in_channel',
      text:
        `🌤️ *Weather in ${data.location.name}, ${data.location.country}*\n\n` +
        `🌡️ Temperature: ${data.current.temperature}°C\n` +
        `☁️ Condition: ${data.current.weather_descriptions[0]}\n` +
        `💧 Humidity: ${data.current.humidity}%\n` +
        `💨 Wind: ${data.current.wind_speed} km/h`
    });

  } catch (error) {
    console.error(error);

    await respond({
      response_type: 'ephemeral',
      text: '❌ Something went wrong while getting the weather.'
    });
  }
});

app.command('/mybot-status', async ({ ack, respond }) => {
  await ack();

  const uptime = Math.floor(process.uptime());

  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  await respond({
    response_type: 'ephemeral',
    text:
      `🟢 *MyBot Status*\n\n` +
      `Status: Online ✅\n` +
      `Socket Mode: Connected 🔌\n` +
      `Uptime: ${hours}h ${minutes}m ${seconds}s`
  });
});

app.command('/mybot-about', async ({ ack, respond }) => {
  await ack();

  await respond({
    response_type: 'ephemeral',
    text:
      `🤖 *About MyBot*\n\n` +
      `MyBot is a Slack assistant built with:\n` +
      `• Node.js\n` +
      `• Slack Bolt\n` +
      `• Weatherstack API\n` +
      `• Socket Mode\n\n` +
      `Version: 1.0.0\n` +
      `Status: Active 🟢`
  });
});

(async () => {
  await app.start();

  const port = process.env.PORT || 3000;

  http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("MyBot is online! 🤖");
  }).listen(port, "0.0.0.0", () => {
    console.log(`🌐 Web server running on port ${port}`);
    console.log("⚡️ Bolt app is running!");
  });
})();

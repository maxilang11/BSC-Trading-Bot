const puppeteer = require('puppeteer');
const Twitter = require('twitter-v2');
const { log } = require('./loggerHandler');

require('dotenv-safe').config();

var twitterClient  = new Twitter({
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
});

let page;

async function listenForever(streamFactory, dataConsumer) {
  try {
    for await (const { data } of streamFactory()) {
      dataConsumer(data);
    }
    log.info('Stream disconnected healthily. Reconnecting.');
    listenForever(streamFactory, dataConsumer);
  } catch (error) {
    log.warn('Stream disconnected with error. Retrying after cooldown.', error);
    await new Promise(r => setTimeout(r, 2000)); // wait 2s

    if(error.message !== 'Stream unresponsive') {
      log.warn('unexpected error continue after 10s');
      await new Promise(r => setTimeout(r, 10000)); // wait 10s
    }

    listenForever(streamFactory, dataConsumer);
  }
}

async function listenToTweets(onNewTweet) {
  const urlParams = {
    "tweet": {
      "fields": "text,source",
    }
  };

  listenForever(
    () => twitterClient.stream('tweets/search/stream', urlParams),
    onNewTweet,
  );
  log.info(`started listenning to twitter stream`);
}

function extractLastLink(text) {
  const lastLinkIndex = text.lastIndexOf('https://');
  const link = text.substring(lastLinkIndex);

  var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  
  if(!link.match(regex)) return null;
  if(link.indexOf('t.co') === -1) return null;

  return link;
}

function resolveTwitterLink(shortenedLink) {
  return new Promise(async (resolve, reject) => {
    page.on("framenavigated", async function onFrameChange(frame) {
      if(frame.url() === shortenedLink) return;
  
      resolve(frame.url());
      page.removeListener("framenavigated", onFrameChange);
    });
  
    await page.goto(shortenedLink);
  });
}

async function init() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  
  page = await browser.newPage();
  page.goto(process.env.TWITTER_SHORTENER_EXAMPLE_LINK);
}

init();

module.exports = {
  resolveTwitterLink,
  listenToTweets,
  extractLastLink,
}

const { getParagraphsFromPostId, findContractAddressInParagraphs, extractMediumPostId } = require('./handler/mediumHandler');
const { extractLastLink, resolveTwitterLink, listenToTweets } = require('./handler/twitterHandler');
const { tradeToken, tradeTokenBack, approveContract } = require('./handler/pancakeHandler');
const { log } = require('./handler/loggerHandler');
const { sendMail } = require('./handler/emailNotifyer');

async function onNewTweet(tweet) {
  try {
    log.info(`new tweet: ${JSON.stringify(tweet)}`);

    const twitterLink = extractLastLink(tweet.text);
    log.info(`twitterLink: ${JSON.stringify(twitterLink)}`);
    if (twitterLink === null) return;
  
    const link = await resolveTwitterLink(twitterLink);
    log.info(`link: ${JSON.stringify(link)}`);
    if (link === null) return;
  
    const postId = extractMediumPostId(link);
    log.info(`postId: ${JSON.stringify(postId)}`);
    if (postId === null) return;
  
    const paragraphs = await getParagraphsFromPostId(postId);
    log.info(`paragraphs: ${JSON.stringify(paragraphs)}`);
    if(paragraphs.constructor !== Array) return;
  
    const contractAddress = findContractAddressInParagraphs(paragraphs);
    log.info(`contractAddress: ${JSON.stringify(contractAddress)}`);
    if (contractAddress === null) return;

    const receivedTokenAmount = await tradeToken(contractAddress);
    log.info(`receivedTokenAmount: ${receivedTokenAmount}`);
    sendMail(`receivedTokenAmount: ${receivedTokenAmount}`);
    
    approveContract(contractAddress);

    await new Promise(r => setTimeout(r, 55 * 1000));

    const recievedWBNB = await tradeTokenBack(contractAddress, receivedTokenAmount);
    log.info(`recievedWBNB: ${recievedWBNB}`);
    sendMail(`recievedWBNB: ${recievedWBNB}`);
  } catch(e) {
    log.error(e);
  }
}

async function init() {
  await new Promise(r => setTimeout(r, 2000)); // wait 2s for initialization of puppeteer & co
  listenToTweets(onNewTweet);
}

init();
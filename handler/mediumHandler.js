const {
  GraphqlFeedController
} = require("./GraphqlFeedController");
const { web3 } = require('./web3Handler');

async function getParagraphsFromPostId(postId) {
  const graphqlFeedController = new GraphqlFeedController();
  const paragraphs = await graphqlFeedController.getParagraphsFromPostId(postId);

  return paragraphs;
}

function validateBscLinkAndExtractContractAddress(link) {
  const lastSlashIndex = link.lastIndexOf('/');
  if(lastSlashIndex === -1) return null;

  const expectedContractAddress = link.substring(lastSlashIndex + 1);

  if(!web3.utils.isAddress(expectedContractAddress)) return null;

  return expectedContractAddress;
}

function findContractAddressInParagraphs(paragraphs) {
  const poisoningIndex = paragraphs.findIndex((paragraph) => {
    return paragraph.text && paragraph.text.includes('BEWARE OF FOOD POISONING!');
  });

  const expectedBscLinkIndex = poisoningIndex + 2;
  const expectedBscLink = paragraphs[expectedBscLinkIndex].text;

  const contractAddress = validateBscLinkAndExtractContractAddress(expectedBscLink);
  return contractAddress;
}

function extractMediumPostId(link) {
  if(link.indexOf('https://pancakeswap.medium.com') === -1) return null;

  const lastDashInLink = link.lastIndexOf('-');
  if(lastDashInLink === -1) return null;

  const postId = link.substring(lastDashInLink + 1);
  var expression = /[0-9A-Fa-f]/i;
  var regex = new RegExp(expression);

  if(!postId.match(regex)) return null;
  return postId;
}

module.exports = {
  getParagraphsFromPostId,
  findContractAddressInParagraphs,
  extractMediumPostId,
}
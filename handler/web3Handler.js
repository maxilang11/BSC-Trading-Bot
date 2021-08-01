const Web3 = require('web3');

require('dotenv-safe').config();

const {
  WALLET_PRIVATE_KEY,
} = process.env;

const bsc = 'https://bsc-dataseed.binance.org/';
const web3 = new Web3(bsc);

const account = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY);

module.exports = {
  web3,
  account,
}
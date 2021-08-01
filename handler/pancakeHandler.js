const { log } = require('./loggerHandler');
const {
  web3,
  account,
} = require('./web3Handler');

require('dotenv-safe').config();

const {
  WALLET_PUBLIC_ADDRESS,
  TOKEN_AMOUNT_WBNB,
} = process.env;

const PANCAKE_CONTRACT = '0x05ff2b0db69458a0750badebc4f9e13add608c7f';
const PANCAKE_CONTRACT_GAS_AMOUNT = 200000;
const TOKEN_CONTRACT_GAS_AMOUNT = 200000;
const WBNB_CONTRACT_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
const DEFAULT_PATH = [ WBNB_CONTRACT_ADDRESS ];

const pancakeRouterContract = new web3.eth.Contract(
  require('./pancakeContractABI.json'),
  PANCAKE_CONTRACT,
);

function timeStampPlus15M() {
  return Date.now() + (15 * 60 * 1000);
}

function tradeToken( tokenContract ) {
  return new Promise(async (resolve, reject) => {
    let completed = false;
    const path = [...DEFAULT_PATH, tokenContract];
    const amount = web3.utils.toWei(TOKEN_AMOUNT_WBNB, "ether");

    const swap = pancakeRouterContract.methods.swapExactTokensForTokens(amount, 0, path, WALLET_PUBLIC_ADDRESS, timeStampPlus15M());
    const encodedABI = swap.encodeABI();

    const tx = {
      from: WALLET_PUBLIC_ADDRESS,
      to: PANCAKE_CONTRACT,
      gas: PANCAKE_CONTRACT_GAS_AMOUNT,
      data: encodedABI,
      value: 0,
    };
  
    const signedTx = await account.signTransaction(tx);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', function(transactionHash){
      log.info(`transactionHash: ${JSON.stringify(transactionHash)}`);
    })
    .on('confirmation', function(confirmationNumber, receipt){
      //
    })
    .on('receipt', function(receipt){
      if(completed) return;
      log.info(`receipt: ${JSON.stringify(receipt)}`);

      const logWithReceivedTokenAmount = receipt.logs.find((log) => log.address.toLowerCase() === tokenContract.toLowerCase());
      const { data } = logWithReceivedTokenAmount;

      completed = true;
      resolve(web3.utils.hexToNumberString(data));
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      log.warn(`transaction was rejected: ${JSON.stringify({
        error,
        receipt,
      })}`);
      reject(error);
    });
  });
}

function approveContract(tokenContractAddress) {
  return new Promise(async (resolve, reject) => {
    let completed = false;

    const tokenContract = new web3.eth.Contract(
      require('./tokenContractABI.json'),
      tokenContractAddress,
    );
    const amount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const swap = tokenContract.methods.approve(PANCAKE_CONTRACT, amount);
    const encodedABI = swap.encodeABI();

    const tx = {
      from: WALLET_PUBLIC_ADDRESS,
      to: tokenContractAddress,
      gas: TOKEN_CONTRACT_GAS_AMOUNT,
      data: encodedABI,
      value: 0,
    };
    
    const signedTx = await account.signTransaction(tx);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', function(transactionHash){
      log.info(`transactionHash: ${JSON.stringify(transactionHash)}`);
    })
    .on('confirmation', function(confirmationNumber, receipt){
      //
    })
    .on('receipt', function(receipt){
      if(completed) return;
      log.info(`receipt: ${JSON.stringify(receipt)}`);
      
      completed = true;
      resolve();
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      log.warn(`transaction was rejected: ${JSON.stringify({
        error,
        receipt,
      })}`);
      reject(error);
    });
  });
}

function tradeTokenBack( tokenContract, amount ) {
  return new Promise(async (resolve, reject) => {
    let completed = false;
    const path = [tokenContract, ...DEFAULT_PATH];

    const swap = pancakeRouterContract.methods.swapExactTokensForTokens(amount, 0, path, WALLET_PUBLIC_ADDRESS, timeStampPlus15M());
    const encodedABI = swap.encodeABI();

    const tx = {
      from: WALLET_PUBLIC_ADDRESS,
      to: PANCAKE_CONTRACT,
      gas: PANCAKE_CONTRACT_GAS_AMOUNT,
      data: encodedABI,
      value: 0,
    };
  
    const signedTx = await account.signTransaction(tx);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', function(transactionHash){
      log.info(`transactionHash: ${JSON.stringify(transactionHash)}`);
    })
    .on('confirmation', function(confirmationNumber, receipt){
      //
    })
    .on('receipt', function(receipt){
      if(completed) return;
      log.info(`receipt: ${JSON.stringify(receipt)}`);

      const logWithReceivedTokenAmount = receipt.logs.find((log) => log.address.toLowerCase() === WBNB_CONTRACT_ADDRESS.toLowerCase());
      const { data } = logWithReceivedTokenAmount;
      
      completed = true;
      resolve(web3.utils.hexToNumberString(data));
    })
    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      log.warn(`transaction was rejected: ${JSON.stringify({
        error,
        receipt,
      })}`);
      reject(error);
    });
  });
}

module.exports = {
  tradeToken,
  tradeTokenBack,
  approveContract,
}
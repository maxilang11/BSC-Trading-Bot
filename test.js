const {
    web3,
    account,
  } = require('./handler/web3Handler');

const test = '0x00000000000000000000000000000000000000000000000f4e173512ff313fb9';

console.log(web3.utils.hexToNumberString(test));
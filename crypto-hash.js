const crypto = require('crypto');
const hexToBinary = require('hex-to-binary');

const cryptoHash = (...inputs) => {
  // encrypt
  const hash = crypto.createHash('sha256');
  hash.update(inputs.sort().join(' '));

  // get hex version
  const hex = hash.digest('hex');

  // convert hex to binary form
  return hexToBinary(hex);
};

module.exports = cryptoHash;

const INITIAL_DIFFICULTY = 3;
const MINE_RATE_IN_MILLIS = 1000;
const MINE_RATE_ADJUSTMENT_IN_MILLIS = 100;
const GENESIS_BLOCK_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  nonce: 0,
  difficulty: INITIAL_DIFFICULTY,
  data: []
};
const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN'
};

module.exports = {GENESIS_BLOCK_DATA, MINE_RATE_IN_MILLIS, MINE_RATE_ADJUSTMENT_IN_MILLIS, CHANNELS};
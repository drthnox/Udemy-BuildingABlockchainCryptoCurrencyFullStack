const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const request = require('request');
const TransactionPool = require('./wallet/transaction-pool');
const Transaction = require('./wallet/transaction');
const Wallet = require('./wallet');

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
const wallet = new Wallet();
const transactionPool = new TransactionPool();

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body;
  const transaction = wallet.createTransaction({ amount:amount, recipient:recipient });
  transactionPool.setTransaction(transaction);
  res.json(transaction);
});

const syncChains = () => {
  console.log(`Syncing chains with ${ROOT_NODE_ADDRESS}/api/blocks`);
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const rootChain = JSON.parse(body);
      console.log('Replacing chain with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening on localhost:${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    console.log(`${PORT} <> ${DEFAULT_PORT}`);
    syncChains();
  }
});

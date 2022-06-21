const express = require('express');
const request = require('request');
const path = require('path');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Transaction = require('./wallet/transaction');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');
const path = require('path');

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

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

  let transaction = transactionPool.transactionExists({ input: wallet.publicKey });

  try {
    const { amount, recipient } = req.body;
    if (transaction) {
      transaction.update({ senderWallet: wallet, amount: amount, recipient: recipient });
    } else {
      transaction = wallet.createTransaction({
        amount: amount,
        recipient: recipient,
        chain: blockchain.chain
      });
    }
  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message })
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  return res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
  return res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
  });
});

<<<<<<< HEAD
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
=======
// default for unmatched URLs
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/dist/index.html'));
});

//---------------
>>>>>>> d794243422f697f29273a168cf65456b85fd507a

const syncWithRootState = () => {
  syncChains();
  syncTransactionPool();
};

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

const syncTransactionPool = () => {
  console.log(`Syncing transaction pool with ${ROOT_NODE_ADDRESS}/api/transaction-pool-map`);
  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const rootTransactionPoolMap = JSON.parse(body);
      console.log('Replacing transation pool map with', rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
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
    syncWithRootState();
  }
});

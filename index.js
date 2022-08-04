const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const request = require('request');
const TransactionPool = require('./wallet/transaction-pool');
const Transaction = require('./wallet/transaction');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');
const path = require('path');

const isDevelopment = process.env.ENV === 'development';
<<<<<<< HEAD

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const REDIS_URL = isDevelopment ?
  'redis://127.0.0.1:6379' :
  'redis://:pe7c9f5f5177874624490cc85574b499e3e3669682e58a55d80cd1a733eaedb54@ec2-23-20-19-160.compute-1.amazonaws.com:15479';
=======
const REDIS_URL = isDevelopment ?
  'redis://localhost:6379' :
  'redis://:p73aeae48875f46e7d581506f5165ff4bc3030b8447a76d3d3ba03edc7e1450df@ec2-44-199-134-149.compute-1.amazonaws.com:25359';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
>>>>>>> origin/master

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

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

<<<<<<< HEAD
//START -------- initialise test data
//Add blocks to test rendering
if (isDevelopment) {
  const walletFoo = new Wallet();
  const walletBar = new Wallet();

  const generateWalletTransaction = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
      recipient, amount, chain: blockchain.chain
    });
    transactionPool.setTransaction(transaction);
  };

  const walletAction = () => {
    generateWalletTransaction({
      wallet, recipient: walletFoo.publicKey, amount: 5
    });
  };

  const walletFooAction = () => {
    generateWalletTransaction({
      wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
    });
  };

  const walletBarAction = () => {
    generateWalletTransaction({
      wallet: walletBar, recipient: wallet.publicKey, amount: 15
    });
  };

=======
if (isDevelopment) {

  //----------
  //Add blocks to test rendering
  const walletFoo = new Wallet();
  const walletBar = new Wallet();

  const generateWalletTransaction = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
      recipient, amount, chain: blockchain.chain
    });
    transactionPool.setTransaction(transaction);
  };

  const walletAction = () => {
    generateWalletTransaction({
      wallet, recipient: walletFoo.publicKey, amount: 5
    });
  };

  const walletFooAction = () => {
    generateWalletTransaction({
      wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
    });
  };

  const walletBarAction = () => {
    generateWalletTransaction({
      wallet: walletBar, recipient: wallet.publicKey, amount: 15
    });
  };

>>>>>>> origin/master
  for (let i = 0; i < 10; i++) {
    if (i % 3 === 0) {
      walletAction();
      walletFooAction();
    } else if (i % 3 === 1) {
      walletFooAction();
      walletBarAction();
    }

    transactionMiner.mineTransactions();
  }
}
<<<<<<< HEAD
//END -------- initialise test data



=======

//--------
>>>>>>> origin/master
let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening on localhost:${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});

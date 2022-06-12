const { STARTING_BALANCE } = require('../config');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
var should = require('should');
var Blockchain = require('../blockchain');

describe('Wallet', () => {

  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    wallet.should.have.property('balance');
    wallet.balance.should.be.equal(STARTING_BALANCE);
  });

  it('has a `publicKey`', () => {
    wallet.should.have.property('publicKey');
  });

  describe('signing data', () => {
    const data = 'foobar';

    it('verifies a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data + 'X')
        })
      ).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        expect(() => wallet.createTransaction({ amount: 999999, recipient: 'some-recipient' })).toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {

      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'some-recipient';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it('creates an instance of `Transaction`', () => {
        transaction.should.be.an.instanceOf(Transaction);
      });

      it('matches the transaction input with the wallet', () => {
        transaction.input.address.should.be.equal(wallet.publicKey);
      });

      it('outputs the result to the recipient', () => {
        transaction.outputMap[recipient].should.be.equal(amount);
      });

    });

    describe('and a chain is passed', () => {

      it('should call the `Wallet.calculateBalance` method', () => {
        const originalCalculateBalance = Wallet.calculateBalance;
        const calculateBalanceMock = jest.fn();
        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          recipient: 'foo',
          amount: 10,
          chain: new Blockchain().chain
        })

        expect(calculateBalanceMock).toHaveBeenCalled();
        Wallet.calculateBalance = originalCalculateBalance;
      });

    });

  });

  describe('calculateBalance()', () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the Wallet', () => {

      it('should return the `STARTING_BALANCE`', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(STARTING_BALANCE);
      });

    });

    describe('and there are outputs for the Wallet', () => {

      let transactionOne, transactionTwo;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 50
        });
        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60
        });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it('should add the sum of all outputs to the wallet balance', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(
          STARTING_BALANCE +
          transactionOne.outputMap[wallet.publicKey] +
          transactionTwo.outputMap[wallet.publicKey]
        )
      });
    });

    describe('and the wallet has made a transaction', () => {
      let recentTransaction;

      beforeEach(() => {
        recentTransaction = wallet.createTransaction({
          amount: 30,
          recipient: 'foo-address'
        });
        blockchain.addBlock({ data: [recentTransaction] });
      });

      it('should return the output amount of the recent transaction', () => {
        Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey }).should.be.equal(recentTransaction.outputMap[wallet.publicKey]);
      });
    });

    describe('and there are outputs next to and after the recent transaction', () => {
      let sameBlockTransaction, nextBlockTransaction;

      beforeEach(() => {
        recentTransaction = wallet.createTransaction({
          recipient: 'later-foo-address',
          amount: 60
        });

        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

        nextBlockTransaction = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 75
        });

        blockchain.addBlock({ data: [nextBlockTransaction] });
      });

      it('should include the output amounts in the returned balance', () => {
        Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey }).should.be.equal(
          recentTransaction.outputMap[wallet.publicKey] +
          sameBlockTransaction.outputMap[wallet.publicKey] +
          nextBlockTransaction.outputMap[wallet.publicKey]
        );
      });

    });
  });
});
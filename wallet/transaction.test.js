const Wallet = require('.');
const Transaction = require('./transaction');
var should = require('should');
const version = require('nodemon/lib/version');
const { verifySignature } = require('../util');

describe('Transaction', () => {
  let transaction,
    senderWallet,
    recipient,
    amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-public-key';
    amount = 50;

    transaction = new Transaction({
      senderWallet,
      recipient,
      amount
    });
  });

  describe('constructor()', () => {
    it('should have an id', () => {
      transaction.should.have.property('id');
    });
  });

  describe('outputMap', () => {
    it('has an `outputMap`', () => {
      transaction.should.have.property('outputMap');
    });

    it('outputs the `amount` to the `recipient`', () => {
      transaction.outputMap.should.have.value(recipient, amount);
    });

    it('outputs the remaining balance for the `senderWallet`', () => {
      transaction.outputMap.should.have.value(senderWallet.publicKey, senderWallet.balance - amount);
    });
  });

  describe('input', () => {
    it('has an `input`', () => {
      transaction.should.have.property('input');
    });

    it('has a `timestamp` in the input', () => {
      (transaction.input).should.have.property('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      (transaction.input).should.have.property('amount', senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` publicKey', () => {
      (transaction.input).should.have.property('address', senderWallet.publicKey);
    });

    it('signs the input', () => {
      verifySignature({
        publicKey: senderWallet.publicKey,
        data: transaction.outputMap,
        signature: transaction.input.signature
      }).should.be.true();
    });
  });

  describe('validate()', () => {
    let errorMock, errSpy;

    beforeEach(() => {
      errorMock = jest.fn();
      errSpy = jest.spyOn(console, 'error');
    });
    describe('when the transaction is valid', () => {
      // only valid when the fields have not ben tampered
      it('returns true', () => {
        var isValid = Transaction.validate(transaction);

        isValid.should.be.true();
      });
    });
    describe('when the transaction is invalid', () => {
      describe('and a transaction outputMap is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[senderWallet.publicKey] = 999999;

          var isValid = Transaction.validate(transaction);

          expect(errSpy).toBeCalled();
          isValid.should.be.false();
        });
      });
      describe('and the transaction input signature is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.input.signature = new Wallet().sign('data');

          var isValid = Transaction.validate(transaction);

          expect(errSpy).toBeCalled();
          isValid.should.be.false();
        });
      });
    });

  });

  describe('update()', () => {
    let nextRecipient;
    let nextAmount = 123;
    let originalSenderOutput;
    let originalSignature;

    beforeEach(() => {
      originalSenderOutput  = transaction.outputMap[senderWallet.publicKey];
      originalSignature = transaction.signature;
      this.nextRecipient = 'next-recipient';
      transaction.update({senderWallet, amount: nextAmount, recipient: nextRecipient});
    });

    it('outputs the amount to the next recipient', () => {
      transaction.outputMap[nextRecipient].should.be.equal(nextAmount);
    });

    it('subtracts the amount from the original sender output amount', () => {
      transaction.outputMap[senderWallet.publicKey].should.be.equal(originalSenderOutput - nextAmount);
    });

    it('maintains a total output that matches the input amount', () => {
      Object.values(transaction.outputMap)
        .reduce((accumulatedTotal, outputAmount) => accumulatedTotal + outputAmount)
        .should.be.equal(transaction.input.amount);
    });

    it('re-signs the transaction', () => {
      console.log('original signature', originalSignature);
      console.log('new signature', transaction.input.signature);
      transaction.input.signature.should.not.be.equal(originalSignature);
    });
  });
});
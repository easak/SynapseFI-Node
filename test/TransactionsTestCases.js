'use strict';

var assert = require('chai').assert;
var Users = require('../lib/Users.js');
var Nodes = require('../lib/Nodes.js');
var Transactions = require('../lib/Transactions.js');
var Helpers = require('./Helpers.js');

var createPayload = {
  to: {
    type: 'SYNAPSE-US',
    id: Helpers.to_node_id
  },
  amount: {
    amount: 2.10,
    currency: 'USD'
  },
  extra: {
    supp_id: '1283764wqwsdd34wd13212',
    note: 'Deposit to synapse account',
    webhook: 'http://requestb.in/q94kxtq9',
    process_on: 0,
    ip: '192.168.0.1'
  }
};

const pageOptions = {
  page: 2,
  per_page: 5
}

const pageParam = {
  page: 3
}

const perPageParam = {
  per_page: 5
}

var testUser;
var testNode;

describe('Transactions', function() {
  this.timeout(30000);

  beforeEach(function(done) {
    Users.get(
      Helpers.client,
      {
        ip_address: Helpers.ip_address,
        fingerprint: Helpers.fingerprint,
        _id: Helpers.user_id
      },
      function(err, user) {
        testUser = user;
        Nodes.get(
          testUser,
          {
            _id: Helpers.node_id
          },
          function(err, node) {
            testNode = node;
            done();
          }
        );
      });
  });

  describe('create', function() {
    it('should create a Transaction object', function(done) {
      Transactions.create(
        testNode,
        createPayload,
        function(err, transaction) {
          assert.equal(transaction.json.recent_status.status_id, '1');
          done();
        }
      );
    });

    // it('should create a transaction with an idempotency key', function(done) {
    //   var options = {
    //     idempotency_key: Math.floor(Math.random() * 1000000000)
    //   };
    //   Transactions.createWithOptions(
    //     testNode,
    //     options,
    //     createPayload,
    //     function(err, transaction) {
    //       // create another transaction using same idempotency key
    //       // should return an error
    //       Transactions.createWithOptions(
    //         testNode,
    //         options,
    //         createPayload,
    //         function(err, trans2) {
    //           assert.equal(transaction.json.recent_status.status_id, '1');
    //           assert.isNotNull(err);
    //           done();
    //         }
    //       );
    //     }
    //   );
    // });
  });

  describe('get transactions', function() {
    it('should get multiple transactions in a JSON format', function(done) {
      Transactions.get(
        testNode,
        {},
        function(err, json) {
          assert(json['trans'].length > 0);
          done();
        }
      );
    });
  });

  describe('get with trans _id', function() {
    it('should get a single Transaction object', function(done) {
      Transactions.get(
        testNode,
        {
          _id: Helpers.trans_id
        },
        function(err, transaction) {
          assert(transaction.json['_id'] === Helpers.trans_id);
          done();
        }
      );
    });
  });

  describe('get all transactions filtered by pagination and limit', () => {
    it('should filter results by page', done => {
      Transactions.get(
        testNode,
        pageParam,
        (err, transactions) => {
          assert.equal(transactions.page, pageParam.page);
          done();
        }
      )
    });

    it('should filter results by limit', done => {
      Transactions.get(
        testNode,
        perPageParam,
        (err, transactions) => {
          assert.equal(transactions.limit, perPageParam.per_page);
          done();
        }
      )
    });

    it('should filter results by both params', done => {
      Transactions.get(
        testNode,
        pageOptions,
        (err, transactions) => {
          assert.equal(transactions.limit, pageOptions.per_page);
          done();
        }
      )
    });
  });

  describe('get all client transactions', () => {
    it('should retrieve all client Transactions', done => {
      Transactions.getClient(
        Helpers.client,
        {},
        (err, transactions) => {
          assert(Array.isArray(transactions.trans));
          assert(transactions.trans.length > 0);
          done();
        }
      )
    });
  });

  describe('get all user transactions', () => {
    it('should get all user transactions', done => {
      Transactions.getUser(
        testUser,
        {},
        (err, transactions) => {
          assert(Array.isArray(transactions.trans));
          assert(transactions.trans[0].to.user._id === Helpers.user_id || transactions.trans[0].from.user_id === Helpers.user_id);
          done();
        }
      )
    });
  });
});

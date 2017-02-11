"use strict";

var Web3 = require('web3');
// create an instance of web3 using the HTTP provider.
// NOTE in mist web3 is already available, so check first if its available before instantiating
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var BigNumber = require('bignumber.js');

var eth = web3.eth;
var async = require('async');

var GivethCampaign = require('./dist/givethcampaign.js');
var MiniMeToken = require('minimetoken');

var gcb = function(err, res) {
    if (err) {
        console.log("ERROR: "+err);
    } else {
        console.log(JSON.stringify(res,null,2));
    }
}

var givethCampaign;

var escapeCaller = eth.accounts[1];
var escapeDestination = eth.accounts[2];
var securityGuard = eth.accounts[3];

const now = Math.floor(new Date().getTime() / 1000);

function deployExample(cb) {
    cb = cb || gcb;
    async.series([
        function(cb) {
            GivethCampaign.deploy(web3, {
                tokenName: "MiniMe Test Token",
                decimalUnits: 18,
                tokenSymbol: "MMT",
                escapeCaller: escapeCaller,
                escapeDestination: escapeDestination,
                absoluteMinTimeLock: 86400,
                timeLock: 86400 * 2,
                securityGuard: securityGuard,
                maxSecurityGuardDelay: 86400 * 21,
                verbose: true,
                startFundingTime: now,
                endFundingTime: now + (86400 * 365 * 30),
                maximumFunding: web3.toWei(10000),
                verbose: true,
            }, function(err, _givethCampaign) {
                if (err) return err;
                givethCampaign = _givethCampaign;
                console.log("Giveth Campaign: " + givethCampaign.contract.address);
                cb();
            });
        },
    ], cb);
}

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _runethtx = require("runethtx");

var _minimetoken = require("minimetoken");

var _minimetoken2 = _interopRequireDefault(_minimetoken);

var _vaultcontract = require("vaultcontract");

var _vaultcontract2 = _interopRequireDefault(_vaultcontract);

var _GivethCampaignSol = require("../contracts/GivethCampaign.sol.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GivethCampaign = function () {
    function GivethCampaign(web3, address) {
        _classCallCheck(this, GivethCampaign);

        this.web3 = web3;
        this.contract = this.web3.eth.contract(_GivethCampaignSol.GivethCampaignAbi).at(address);
    }

    _createClass(GivethCampaign, [{
        key: "getState",
        value: function getState(_cb) {
            var _this = this;

            return (0, _runethtx.asyncfunc)(function (cb) {
                var st = {};
                _async2.default.series([function (cb1) {
                    _this.contract.owner(function (err, _owner) {
                        if (err) {
                            cb1(err);return;
                        }
                        st.owner = _owner;
                        cb1();
                    });
                }, function (cb1) {
                    _this.contract.tokenContract(function (err, _tokenAddress) {
                        if (err) {
                            cb1(err);return;
                        }
                        st.tokenAddress = _tokenAddress;
                        cb1();
                    });
                }, function (cb1) {
                    _this.contract.vaultAddress(function (err, _vaultAddress) {
                        if (err) {
                            cb1(err);return;
                        }
                        st.vaultAddress = _vaultAddress;
                        cb1();
                    });
                }], function (err2) {
                    if (err2) {
                        cb(err2);
                    } else {
                        cb(null, st);
                    }
                });
            }, _cb);
        }
    }, {
        key: "donate",
        value: function donate(opts, cb) {
            return (0, _runethtx.sendContractTx)(this.web3, this.contract, "proxyPayment", opts, cb);
        }
    }], [{
        key: "deploy",
        value: function deploy(web3, opts, _cb) {
            return (0, _runethtx.asyncfunc)(function (cb) {
                var params = Object.assign({}, opts);
                var miniMeToken = void 0;
                var givethCampaign = void 0;
                var vault = void 0;
                var owner = void 0;
                _async2.default.series([function (cb1) {
                    _minimetoken2.default.deploy(web3, opts, function (err, _miniMeToken) {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        miniMeToken = _miniMeToken;
                        cb1();
                    });
                }, function (cb1) {
                    _vaultcontract2.default.deploy(web3, opts, function (err, _vault) {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        vault = _vault;
                        cb1();
                    });
                }, function (cb1) {
                    params.abi = _GivethCampaignSol.GivethCampaignAbi;
                    params.byteCode = _GivethCampaignSol.GivethCampaignByteCode;
                    params.tokenAddress = miniMeToken.contract.address;
                    params.vaultAddress = vault.contract.address;
                    (0, _runethtx.deploy)(web3, params, function (err, _givethCampaign) {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        givethCampaign = new GivethCampaign(web3, _givethCampaign.address);
                        cb1();
                    });
                }, function (cb1) {
                    miniMeToken.contract.controller(function (err, _controller) {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        owner = _controller;
                        cb1();
                    });
                }, function (cb1) {
                    miniMeToken.contract.changeController(givethCampaign.contract.address, {
                        from: owner
                    }, cb1);
                }], function (err) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, givethCampaign);
                });
            }, _cb);
        }
    }]);

    return GivethCampaign;
}();

exports.default = GivethCampaign;
module.exports = exports["default"];

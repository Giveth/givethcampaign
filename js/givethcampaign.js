import async from "async";
import { deploy, send } from "runethtx";
import MiniMeToken from "minimetoken";
import Vault from "vaultcontract";
import {
    GivethCampaignByteCode,
    GivethCampaignAbi,
} from "../contracts/GivethCampaign.sol.js";

export default class GivethCampaign {

    constructor(web3, address) {
        this.web3 = web3;
        this.contract = this.web3.eth.contract(GivethCampaignAbi).at(address);
    }

    getState(cb) {
        const promise = new Promise((resolve, reject) => {
            const st = {};
            async.series([
                (cb1) => {
                    this.contract.owner((err, _owner) => {
                        if (err) { cb1(err); return; }
                        st.owner = _owner;
                        cb1();
                    });
                },
                (cb1) => {
                    this.contract.tokenContract((err, _tokenAddress) => {
                        if (err) { cb1(err); return; }
                        st.tokenAddress = _tokenAddress;
                        cb1();
                    });
                },
                (cb1) => {
                    this.contract.vaultAddress((err, _vaultAddress) => {
                        if (err) { cb1(err); return; }
                        st.vaultAddress = _vaultAddress;
                        cb1();
                    });
                },
            ], (err2) => {
                if (err2) {
                    reject(err2);
                } else {
                    resolve(st);
                }
            });
        });

        if (cb) {
            promise.then(
                (value) => {
                    cb(null, value);
                },
                (reason) => {
                    cb(reason);
                });
        } else {
            return promise;
        }
    }

    static deploy(web3, opts, cb) {
        const promise = new Promise((resolve, reject) => {
            const params = Object.assign({}, opts);
            let miniMeToken;
            let givethCampaign;
            let vault;
            let owner;
            async.series([
                (cb1) => {
                    MiniMeToken.deploy(web3, opts, (err, _miniMeToken) => {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        miniMeToken = _miniMeToken;
                        cb1();
                    });
                },
                (cb1) => {
                    Vault.deploy(web3, opts, (err, _vault) => {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        vault = _vault;
                        cb1();
                    });
                },
                (cb1) => {
                    params.abi = GivethCampaignAbi;
                    params.byteCode = GivethCampaignByteCode;
                    params.tokenAddress = miniMeToken.contract.address;
                    params.vaultAddress = vault.contract.address;
                    deploy(web3, params, (err, _givethCampaign) => {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        givethCampaign = new GivethCampaign(web3, _givethCampaign.address);
                        cb1();
                    });
                },
                (cb1) => {
                    miniMeToken.contract.controller((err, _controller) => {
                        if (err) {
                            cb1(err);
                            return;
                        }
                        owner = _controller;
                        cb1();
                    });
                },
                (cb1) => {
                    miniMeToken.contract.changeController(givethCampaign.contract.address, {
                        from: owner,
                    }, cb1);
                },
            ],
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(givethCampaign);
            });
        });

        if (cb) {
            promise.then(
                (value) => {
                    cb(null, value);
                },
                (reason) => {
                    cb(reason);
                });
        } else {
            return promise;
        }
    }

    donate(opts, cb) {
        const params = Object.assign({}, opts, {
            contract: this.contract,
            method: "proxyPayment",
            extraGas: 50000,
        });
        return send(params, cb);
    }

}

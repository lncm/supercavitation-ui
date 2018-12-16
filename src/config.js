/* eslint-disable global-require */

// TODO find a better way to do this... :)
// let devContractAddress = '0xc62f1ce7aba9990000a71d7d99791026373e7021';
// if (process.env.GANACHE) {
//   const { networks } = require('@lncm/supercavitation-contracts/build/contracts/SwapOffering.json');
//   devContractAddress = networks[Object.keys(networks).pop()].address;
// }

export const devServer = process.env.DEV_SERVER;

export const appTitle = 'Supercavitation Swaps';

export const explorerUrl = 'https://explorer.testnet.rsk.co';
export const evmNode = process.env.GANACHE ? 'http://localhost:8545' : 'https://public-node.testnet.rsk.co';

export const derivationPath = "m/44'/37310'/0'/0/";
export const randomMnemonic = 'drama rescue intact royal denial oblige direct vendor market soda mandate accident';

export const gasPrice = 1;
export const gas = 6721975;

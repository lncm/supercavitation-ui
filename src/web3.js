import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
import SwapOffering from '@lncm/supercavitation-contracts/build/contracts/SwapOffering.json';

import { base64toHex } from './util';

const rskTestnetDerivation = "m/44'/37310'/0'/0/";

let web3;

// const contractAddress = SwapOffering.networks['31'].address;

export async function getAddress() {
  const [address] = await web3.eth.getAccounts();
  return address;
}

export async function getAccountInfo(mnemonic) {
  const provider = new HDWalletProvider(mnemonic, 'https://public-node.testnet.rsk.co', 0, 1, false, rskTestnetDerivation);
  web3 = new Web3(provider);
  const address = await getAddress();
  const balance = await web3.eth.getBalance(address);

  return { address, balance };
}

// cache contract composing
const contracts = {};
function getContract(address) {
  if (!contracts[address]) {
    contracts[address] = new web3.eth.Contract(SwapOffering.abi, address);
  }
  return contracts[address];
}

export async function getContractInfo(address) {
  if (!address) { throw new Error('Enter an Address'); }
  const contract = getContract(address);
  const [httpEndpoint, owner, lockedFunds, balance] = await Promise.all([
    contract.methods.url().call(),
    contract.methods.owner().call(),
    contract.methods.lockedFunds().call(),
    web3.eth.getBalance(address),
  ]);
  return { httpEndpoint, owner, lockedFunds, balance };
}


export async function awaitSwapStatus({ contractAddress, fullHash, completionTimeout }) {
  // TODO cancel poll, etc..
  const hash = base64toHex(fullHash);
  const contract = getContract(contractAddress);
  return new Promise(async (resolve) => {
    async function poll() {
      // if we pass completion timeout, we expect the payment to be completed...
      if (completionTimeout) {
        setTimeout(() => resolve({ timeout: true }), completionTimeout);
      }
      try {
        const pollData = await contract.methods.getSwap(hash).call();
        const latestBlock = await web3.eth.getBlockNumber();
        console.log('got latest', pollData, latestBlock);
        // if completionTimeout is set, only resolve if status isn't 0
        if (completionTimeout && pollData.status === '0') {
          console.log('contract not resolved yet, trying again...');
        } else {
          resolve({ ...pollData, latestBlock });
        }
      } catch (e) {
        console.log('not mined, trying again...', e);
      }
      await new Promise(r => setTimeout(r, 5000));
      poll();
    }
    poll();
  });
}

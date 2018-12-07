import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
import SwapOffering from '@lncm/supercavitation-contracts/build/contracts/SwapOffering.json';

import { gas, gasPrice, evmNode, derivationPath } from '../config';

let web3;

export async function getAddress() {
  const [address] = await web3.eth.getAccounts();
  return address;
}

export async function getAccountInfo(mnemonic) {
  const provider = new HDWalletProvider(mnemonic, evmNode, 0, 1, false, derivationPath);
  provider.engine.stop();
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
  let [httpEndpoint, owner, lockedFunds, balance] = await Promise.all([
    contract.methods.url().call(),
    contract.methods.owner().call(),
    contract.methods.lockedFunds().call(),
    web3.eth.getBalance(address),
  ]);
  httpEndpoint = 'http://localhost:8081'; // dev mode
  return { httpEndpoint, owner, lockedFunds, balance };
}
export function monitorSwap({ preImageHash, contractAddress, updateState }) {
  const contract = getContract(contractAddress);
  const hash = `0x${preImageHash}`;
  const poller = {
    async poll() {
      if (!poller.stopped) {
        try {
          const pollData = await contract.methods.getSwap(hash).call();
          console.log(pollData);
          await updateState({ ...pollData });
        } catch (err) {
          console.error(err);
          await updateState({ err });
        }
        await new Promise(r => setTimeout(r, 2000));
        console.log('polling again...');
        this.poll();
      }
    },
    stop() {
      console.log('stopping polling');
      poller.stopped = true;
    },
  };
  poller.poll();
  return poller;
}

export async function claimFunds({ contractAddress, preImage, preImageHash }) {
  const contract = getContract(contractAddress);
  const from = await getAddress();
  console.log('creating transaction', { preImageHash, preImage, contract, from, gasPrice });
  const tx = await new Promise((resolve) => {
    contract.methods.completeSwap(`0x${preImageHash}`, `0x${preImage}`).send({ from, gasPrice, gas })
      .on('transactionHash', resolve);
  });
  console.log(tx);
  return tx;
}

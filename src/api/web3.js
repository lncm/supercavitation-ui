import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
import SwapOffering from '@lncm/supercavitation-contracts/build/contracts/SwapOffering.json';
import { gas, gasPrice, evmNode, derivationPath, devServer } from '../config';

let web3;

// cache contract composing
const contracts = {};
function getContract(address) {
  if (!contracts[address]) {
    contracts[address] = new web3.eth.Contract(SwapOffering.abi, address);
  }
  return contracts[address];
}

export async function getAddress() {
  const [address] = await web3.eth.getAccounts();
  return address;
}

export function ecRecover(...args) {
  return web3.eth.personal.ecRecover(...args);
}

export async function initializeWeb3(mnemonic) {
  const provider = new HDWalletProvider(mnemonic, evmNode, 0, 1, false, derivationPath);
  provider.engine.stop();
  web3 = new Web3(provider);
  const address = await getAddress();
  return { address };
}

export async function getContractInfo(address) {
  if (!address) { throw new Error('Enter an Address'); }
  const code = await web3.eth.getCode(address);
  if (code === '0x00') { throw new Error(`No contract found at address ${address}`); }
  if (SwapOffering.deployedBytecode !== code) { throw new Error('Contract code could not be verified'); }
  const contract = getContract(address);
  const [httpEndpoint, owner, lockedFunds, balance] = await Promise.all([
    devServer || contract.methods.url().call(),
    contract.methods.owner().call(),
    contract.methods.lockedFunds().call(),
    web3.eth.getBalance(address),
  ]);
  return { httpEndpoint, owner, lockedFunds, balance };
}

export async function getBalance(address) {
  return web3.eth.getBalance(address);
}

export function monitorSwap({ onError, preImageHash, contractAddress, updateState }) {
  const contract = getContract(contractAddress);
  const hash = `0x${preImageHash}`;
  const poller = {
    async poll() {
      if (!poller.stopped) {
        try {
          const pollData = await contract.methods.getSwap(hash).call();
          await updateState({ ...pollData });
        } catch (err) {
          await onError(err);
        }
        await new Promise(r => setTimeout(r, 2000));
        this.poll();
      }
    },
    stop() {
      poller.stopped = true;
    },
  };
  poller.poll();
  return poller;
}

export async function claimFunds({ contractAddress, preImage, preImageHash }) {
  const contract = getContract(contractAddress);
  const from = await getAddress();
  const tx = await new Promise((resolve) => {
    contract.methods.completeSwap(`0x${preImageHash}`, `0x${preImage}`).send({ from, gasPrice, gas })
      .on('transactionHash', resolve);
  });
  return tx;
}

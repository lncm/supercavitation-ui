import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
import SwapOffering from '@lncm/supercavitation-contracts/build/contracts/SwapOffering.json';

const rskTestnetDerivation = "m/44'/37310'/0'/0/";

let web3;

const contractAddress = SwapOffering.networks['31'].address;

export async function getAccountInfo(mnemonic) {
  const provider = new HDWalletProvider(mnemonic, 'https://public-node.testnet.rsk.co', 0, 1, false, rskTestnetDerivation);
  web3 = new Web3(provider);
  const [address] = await web3.eth.getAccounts();
  const balance = await web3.eth.getBalance(address);

  return { address, balance };
}

// cache contract composing
const contracts = {};
function getContract(address) {
  if (!contracts[address]) {
    contracts[address] = new web3.eth.Contract(SwapOffering.abi, contractAddress);
  }
  return contracts[address];
}

export async function getContractInfo(address) {
  if (!address) { throw new Error('Enter an Address'); }
  const contract = getContract(address);
  const [httpEndpoint, owner, lockedFunds, balance] = await Promise.all([
    contract.methods.httpEndpoint().call(),
    contract.methods.owner().call(),
    contract.methods.lockedFunds().call(),
    web3.eth.getBalance(address),
  ]);
  return { httpEndpoint, owner, lockedFunds, balance };
}

import Web3 from 'web3';
import HDWalletProvider from 'truffle-hdwallet-provider';
import SwapOffering from '@lncm/supercavitation-contracts/build/contracts/SwapOffering.json';

const gasPrice = 1;
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
  return new Promise((resolve) => {
    let resolved = false;
    const poller = {
      async poll() {
        if (!poller.stopped) {
          try {
            const pollData = await contract.methods.getSwap(hash).call();
            console.log(pollData);
            await updateState({ ...pollData });
          } catch (err) {
            console.log(err);
            await updateState({ err });
          }
          // return this after the first request
          if (!resolved) {
            resolved = true;
            resolve(poller);
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
  });
}

export async function claimFunds({ contractAddress, preImage, preImageHash }) {
  const contract = getContract(contractAddress);
  const from = await getAddress();
  const { tx: txid } = await contract.methods.completeSwap(`0x${preImageHash}`, `0x${preImage}`).send({ from, gasPrice });
  return txid;
}

export async function awaitTxMined({ txid }) {
  return new Promise((resolve) => {
    async function poll() {
      const tx = await web3.eth.getTransaction(txid);
      if (tx.blockNumber) {
        return resolve(tx);
      }
      await new Promise(r => setTimeout(r, 5000));
      poll();
    }
    poll();
  });
}

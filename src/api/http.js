import { getAddress, ecRecover } from './web3';
import { sha256, decodeInvoice } from '../util';

async function fetchAndVerify(params, address) {
  const payload = await (await fetch(...params)).json();
  if (payload.error) { throw new Error(payload.error); }
  // quick and dirty match first
  if (payload.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error(`Address ${payload.address} does not match contract owner ${address}`);
  }
  // verify the hash
  const hash = await sha256(payload.data, 'utf8');
  if (hash !== payload.hash) {
    throw new Error('Payload hash does not match');
  }
  // verify the signature
  const signer = await ecRecover(hash, payload.signature);
  if (signer.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Cannot verify owner signature!');
  }
  // ensure it was signed within the last 10 seconds (to add some replay protection)
  const parsed = JSON.parse(payload.data);
  if ((new Date() - new Date(parsed.timestamp)) > 10 * 1000) {
    throw new Error('Data was signed too long ago.');
  }
  // return parsed json data
  return parsed.json;
}

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function postData([uri, data], address) {
  // TODO sign the data...
  return fetchAndVerify([uri, { headers, method: 'POST', body: JSON.stringify(data) }], address);
}

// EXPORTS

export async function getOfferingInfo(httpEndpoint, owner) {
  return fetchAndVerify([`${httpEndpoint}/info`], owner);
}

export async function requestInvoices({ requestedAmountInSatoshis, contractAddress, owner, httpEndpoint }) {
  const data = { amount: requestedAmountInSatoshis, customer: await getAddress(), contract: contractAddress };
  const { paymentInvoice, depositInvoice, preImageHash } = await postData([`${httpEndpoint}/swap`, data], owner);
  // TODO, validate the returned invoice data against blockchain...
  // TODO, validate that I am the recipient...
  const paymentInvoiceData = decodeInvoice(paymentInvoice);
  return {
    depositInvoice,
    depositInvoiceData: depositInvoice && decodeInvoice(depositInvoice),
    paymentInvoice,
    paymentInvoiceData,
    // IMPORTANT in dev mode we do not use the actual preImageHash
    preImageHash: process.env.GANACHE ? preImageHash : paymentInvoiceData.preImageHash,
  };
}

export async function getStatus({ preImageHash, httpEndpoint, existing, owner }) {
  // TODO retry if it fails... ?
  const uri = `${httpEndpoint}/swap?preImageHash=${preImageHash}${existing ? '&existing=1' : ''}`;
  let data;
  try {
    data = await fetchAndVerify([uri], owner);
  } catch (err) {
    throw err;
  }
  if (data.error) {
    throw new Error(`Service error: ${data.error}`);
  }
  if (existing) {
    return {
      ...data,
      paymentInvoiceData: decodeInvoice(data.paymentInvoice),
      depositInvoiceData: data.depositInvoice && decodeInvoice(data.depositInvoice),
    };
  }
  return data;
}

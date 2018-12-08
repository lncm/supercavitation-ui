import { decode } from 'lightnode-invoice';

import { getAddress, ecRecover } from './web3';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function fetchAndVerify(params, address) {
  const json = await (await fetch(...params)).json();
  // quick and dirty match first
  if (json.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error(`Address ${json.address} does not match contract owner ${address}`);
  }
  // verify the signature
  const signer = await ecRecover(json.data, json.signature);
  if (signer.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Cannot verify owner signature!');
  }
  // return parsed json data
  return JSON.parse(json.data);
}

async function postData([uri, data], address) {
  // TODO sign the data...
  return fetchAndVerify([uri, { headers, method: 'POST', body: JSON.stringify(data) }], address);
}

const networks = {
  tb: 'testnet',
  bc: 'mainnet',
  crt: 'regression',
  sm: 'simnet',
};

function decodeInvoice(invoice) {
  const decoded = decode(invoice);
  const fields = decoded.fields.map(({ value }) => value);
  return {
    memo: fields[1],
    expiry: fields[3],
    amount: Math.round(decoded.amount * 1e8), // todo use a bignumber library, as this is dangerous
    network: networks[decoded.network],
    preImageHash: fields[0].toString('hex'),
  };
}

// EXPORTS

export async function getOfferingInfo(httpEndpoint, owner) {
  return fetchAndVerify([`${httpEndpoint}/info`], owner);
}

export async function requestInvoices({ requestedAmountInSatoshis, contractAddress, owner, httpEndpoint }) {
  const data = { amount: requestedAmountInSatoshis, customer: await getAddress(), contract: contractAddress };
  const { paymentInvoice, depositInvoice } = await postData([`${httpEndpoint}/swap`, data], owner);
  // TODO, validate the returned invoice data against blockchain...
  const paymentInvoiceData = decodeInvoice(paymentInvoice);
  return {
    depositInvoice,
    depositInvoiceData: depositInvoice && decodeInvoice(depositInvoice),
    paymentInvoice,
    paymentInvoiceData,
    preImageHash: paymentInvoiceData.preImageHash,
  };
}

export async function getStatus({ preImageHash, httpEndpoint, existing, owner }) {
  // TODO retry if it fails... ?
  const uri = `${httpEndpoint}/swap?preImageHash=${preImageHash}${existing ? '&existing=1' : ''}`;
  let data;
  try {
    data = await fetchAndVerify([uri], owner);
  } catch (e) {
    throw new Error('Could not reach swap service');
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

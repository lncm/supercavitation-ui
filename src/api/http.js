import { decode } from 'lightnode-invoice';

import { getAddress } from './web3';

const headers = {
  // disabled for now to stop preflight request
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export async function getOfferingInfo(httpEndpoint) {
  return (await fetch(`${httpEndpoint}/info`)).json();
}

async function postData(uri, data) {
  return (await fetch(uri, { headers, method: 'POST', body: JSON.stringify(data) })).json();
}
const networks = {
  tb: 'testnet',
  bc: 'mainnet',
  crt: 'regression',
  sm: 'simnet',
};

function decodeInvoice(invoice) {
  const decoded = decode(invoice);
  const [preImageHash, memo, cltv, expiry] = decoded.fields.map(({ value }) => value);
  return {
    memo,
    expiry,
    amount: Math.round(decoded.amount * 1e8), // todo use a bignumber library, as this is dangerous
    network: networks[decoded.network],
    preImageHash: preImageHash.toString('hex'),
  };
}

export async function requestInvoices({ requestedAmountInSatoshis, contractAddress, httpEndpoint }) {
  const data = { amount: requestedAmountInSatoshis, customer: await getAddress(), contract: contractAddress };
  const { paymentInvoice, depositInvoice } = await postData(`${httpEndpoint}/swap`, data);
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

export async function getStatus({ preImageHash, httpEndpoint }) {
  const uri = `${httpEndpoint}/swap?preImageHash=${preImageHash}`;
  const data = await (await fetch(uri)).json();
  return data;
}

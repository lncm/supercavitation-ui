import { decode } from 'lightnode-invoice';

import { getAddress } from './web3';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export async function getOfferingInfo(httpEndpoint) {
  return (await fetch(`${httpEndpoint}/info`)).json();
}

async function postData(uri, data) {
  return (await fetch(uri, { headers, method: 'POST', body: JSON.stringify(data) })).json();
}

export async function requestInvoices({ spendAmount, contractAddress, httpEndpoint }) {
  const { paymentInvoice, depositInvoice } = await postData(`${httpEndpoint}/swap`, { amount: spendAmount, customer: await getAddress(), contract: contractAddress });
  // get the preimage, validate shit...
  const preImageHash = decode(paymentInvoice).fields[0].value.toString('hex');
  return { paymentInvoice, depositInvoice, preImageHash };
}

export async function getStatus({ preImageHash, httpEndpoint }) {
  const uri = `${httpEndpoint}/swap?preImageHash=${preImageHash}`;
  console.log({ uri });
  const data = await (await fetch(uri)).json();
  console.log('got data', data);
  return data;
}
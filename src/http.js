import { getAddress } from './web3';

export async function getSwapInfo(httpEndpoint) {
  return (await fetch(`${httpEndpoint}/info`)).json();
}

export async function requestSmallInvoice({ spendAmount, httpEndpoint }) {
  const address = await getAddress();
  const uri = `${httpEndpoint}/smallInvoice?amount=${spendAmount}&address=${address}`;
  // TODO verify signature
  return (await fetch(uri)).json();
}

// sample response
const response = { msg: { invoice: 'lntb23440n1pdln8gppp5urrsqe3zhweddluwz322pfnanf7xkuwnapays4zqfr3xg2kykk6qdqqcqzyspxkmcgax9enremqrcaza7dngpj0ctcnmyvssw60u6cgu6ne6964pwt0ywf36r3cezlz0u3l6dy27c0ueux5svn8fe68w4awx78ccjeqq2d7072', hash: '4McAZiK7stb/jhRUoKZ9mnxrcdPoekhUQEjiZCrEtbQ=' }, txid: '0xfc08e572782e95c4a7047ec32c6de5e877f2ee7377427e84a1f0831f7ab71e4e' };
export async function requestFullInvoice({ smallHash, httpEndpoint }) {

  // parse the hash into a hex vlaue
  
  // const uri = `${httpEndpoint}/fullInvoice`;
  // return (fetch(uri, { method: 'POST', body: JSON.stringify({ smallHash }) })).json();
  await new Promise(r => setTimeout(r, 1000));
  // TODO check the response....
  return response;
}

export async function awaitMainPayment({ httpEndpoint, fullHash }) {
  const uri = `${httpEndpoint}/checkPayment`;
  return new Promise(async (resolve) => {
    setTimeout(() => resolve({ timeout: true }), 2 * 60 * 1000); // wait two minutes
    return (await fetch(uri, { method: 'POST', body: JSON.stringify({ fullHash }) })).json();
  });
}
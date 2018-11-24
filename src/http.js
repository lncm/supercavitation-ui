export async function getSwapInfo(httpEndpoint) {
  console.log('fetching, httpEndpoint', httpEndpoint);
  await new Promise(r => setTimeout(r, 100));
  return {
    text: 'Hello, I\'m Bob. I would never scam you. Trust me ;).',
    minAmount: 1000,
    timeLockNumber: 30,
    depositFee: 50,
    exchangeRate: 0.98,
    reward: 10000,
  };
}

import { decode } from 'lightnode-invoice';

function hex(buffer) {
  const hexCodes = [];
  const view = new DataView(buffer);
  for (let i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    const value = view.getUint32(i);
    // toString(16) will give the hex representation of the number without padding
    const stringValue = value.toString(16);
    // We use concatenation and slice for padding
    const padding = '00000000';
    const paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }
  // Join all the hex strings into one
  return hexCodes.join('');
}

export function sha256(str) {
  // We transform the string into an arraybuffer.
  const buffer = Buffer.from(str, 'hex');
  return crypto.subtle.digest('SHA-256', buffer).then((hash) => {
    return hex(hash);
  });
}

const networks = {
  tb: 'testnet',
  bc: 'mainnet',
  crt: 'regression',
  sm: 'simnet',
};

export function decodeInvoice(invoice) {
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

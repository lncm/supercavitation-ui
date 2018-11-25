/* eslint-disable */

export function base64toHex(base64) {
  return '0x' + window.atob(base64)
      .split('')
      .map(function (aChar) {
        return ('0' + aChar.charCodeAt(0).toString(16)).slice(-2);
      })
     .join('')
     .toLowerCase(); // Per your example output
}

function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
  for (var i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    var value = view.getUint32(i)
    // toString(16) will give the hex representation of the number without padding
    var stringValue = value.toString(16)
    // We use concatenation and slice for padding
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue);
  }

  // Join all the hex strings into one
  return hexCodes.join("");
}

export function sha256(str) {
  // We transform the string into an arraybuffer.
  var buffer = new Buffer(str, 'hex');
  return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
    return hex(hash);
  });
}

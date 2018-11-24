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


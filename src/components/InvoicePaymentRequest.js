import React from 'react';
import QRCode from 'qrcode.react';
import { Code, Callout } from '@blueprintjs/core';

export default ({ invoice, invoiceAmount, swapAmountWei }) => {
  const uri = `lightning:${invoice}`;
  return (
    <div>
      <Callout title="Scan or Tap To Pay">
        <div>This invoice requests <b>{invoiceAmount}</b> LN satoshis</div>
        <div style={{ marginBottom: '0.5em' }}>
          {swapAmountWei
            ? <span>Pay this invoice to receive <b>{swapAmountWei}</b> wei</span>
            : <span>Pay this deposit to generate the swap</span>
            }
        </div>
        <a href={uri}>
          <QRCode value={uri} renderAs="svg" style={{ width: '100%', height: 'auto' }} />
          <Code className="scrollx">
            {uri}
          </Code>
        </a>
      </Callout>
    </div>
  );
};

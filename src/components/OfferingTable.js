import React from 'react';
import { HTMLTable } from '@blueprintjs/core';

import ExplorerLink from './ExplorerLink';

const table = [
  ['contract', 'Contract Address', ({ contractAddress: a }) => <ExplorerLink type="address" data={a} chars={16} />],
  ['owner', 'Contract Owner', ({ owner: a }) => <ExplorerLink type="address" data={a} chars={16} />],
  ['httpEndpoint', 'Server URL'],
  ['version', 'Server Version'],
  ['timeLockBlocks', 'Time Lock Blocks'],
  ['minAmountSatoshis', 'Min Order (Satoshis)'],
  ['rate', 'Exchange Fee (%)', ({ exchangeRate: r }) => `${100 - (r / 1e10 * 100).toFixed(4)}%`],
  ['exchangeRate', 'Rate (Satoshis to Wei)'],
  ['depositFeeSatoshis', 'Deposit Fee (Satoshis)'],
  ['rewardWei', 'Close Reward (Wei)'],
  ['supercavitationWei', 'Supercavitation (Wei)'],
  ['balance', 'Total Balance (Wei)'],
  ['lockedFunds', 'Locked Funds (Wei)'],
];

export default props => (
  <div>
    <HTMLTable bordered condensed striped>
      <tbody>
        {table.map(r => (
          <tr key={r[0]}>
            <th>{r[1]}</th>
            <td>{(r[2] && r[2](props)) || props[r[0]]}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  </div>
);

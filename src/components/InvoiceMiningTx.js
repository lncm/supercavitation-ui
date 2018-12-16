import React from 'react';
import { Callout } from '@blueprintjs/core';

import ExplorerLink from './ExplorerLink';

export default ({ settleTx, mining, miningTx }) => (
  <Callout
    intent={mining ? 'warning' : 'success'}
    title={mining ? 'Mining Transaction' : 'Mined Transaction'}
    icon={mining ? 'time' : 'link'}
  >
    <div>
      {mining && !settleTx && <b>Swap is being created!</b>}
      {!mining && !settleTx && <div>The swap has been created; you can now safely pay the settlement invoice!</div>}
      {mining && settleTx && <b>The settlement has been published!</b>}
      {!mining && settleTx && <b>The swap is settled!</b>}
    </div>
    <ExplorerLink type="tx" data={miningTx} />
    {mining && <div>Please wait a monent for it to be mined...</div>}
  </Callout>
);

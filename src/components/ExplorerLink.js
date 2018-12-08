import React from 'react';
import { explorerUrl } from '../config';

export default ({ type, data, chars }) => (
  <a className="trunchate" href={`${explorerUrl}/${type}/${data}`} target="_blank">
    {chars ? `${data.slice(0, chars)}...` : data}
  </a>
);

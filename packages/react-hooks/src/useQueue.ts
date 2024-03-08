// Copyright 2017-2024 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { QueueProps } from '@polkadot/react-components/Status/types';

import { useContext } from 'react';

import { QueueCtx } from './ctx/Queue';
import { createNamedHook } from './createNamedHook';

function useQueueImpl (): QueueProps {
  return useContext(QueueCtx);
}

export const useQueue = createNamedHook('useQueue', useQueueImpl);

// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { BlockEVMEvent } from '../types';

import { useContext } from 'react';

import { createNamedHook } from '@polkadot/react-hooks';

import { BlockEVMEventsCtx } from '../providers/BlockEVMEvents';

function useBlockEVMEventsImpl (): BlockEVMEvent[] {
  return useContext(BlockEVMEventsCtx);
}

export const useBlockEVMEvents = createNamedHook('useBlockEVMEvents', useBlockEVMEventsImpl);

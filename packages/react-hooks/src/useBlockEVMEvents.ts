// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { BlockEvents } from './ctx/types';

import { useContext } from 'react';

import { BlockEVMEventsCtx } from './ctx/BlockEVMEvents';
import { createNamedHook } from './createNamedHook';
import {BlockEVMEvents} from "./ctx/types";

function useBlockEVMEventsImpl (): BlockEVMEvents {
  return useContext(BlockEVMEventsCtx);
}

export const useBlockEVMEvents = createNamedHook('useBlockEVMEvents', useBlockEVMEventsImpl);

// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from './types';

import { chainsRootnetPNG } from '../ui/logos/chains';

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   providers: The actual hosted secure websocket endpoint
//
// IMPORTANT: Alphabetical based on text
export const testChains: EndpointOption[] = [
  {
    info: 'porcini',
    providers: {
      'TRN-GLOBAL': 'wss://porcini.rootnet.app/archive/ws'
    },
    text: 'Porcini (Archive Node)',
    ui: {
      color: '#546A7B',
      logo: chainsRootnetPNG
    }
  },
  {
    info: 'porcini',
    providers: {
      'TRN-GLOBAL': 'wss://porcini.rootnet.app/ws'
    },
    text: 'Porcini (Full Node)',
    ui: {
      color: '#546A7B',
      logo: chainsRootnetPNG
    }
  }

];

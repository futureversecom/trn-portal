// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from './types.js';

import { chainsRootnetPNG } from '@polkadot/apps-config/ui/logos/chains';

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   providers: The actual hosted secure websocket endpoint
//
// IMPORTANT: Alphabetical based on text
export const prodChains: EndpointOption[] = [
  {
    info: 'rootnet',
    providers: {
      'TRN-GLOBAL': 'wss://root.rootnet.live/archive/ws'
    },
    text: 'Root (Archive Node)',
    ui: {
      color: '#000000',
      logo: chainsRootnetPNG
    }
  },
  {
    info: 'rootnet',
    providers: {
      'TRN-GLOBAL': 'wss://root.rootnet.live/ws'
    },
    text: 'Root (Full Node)',
    ui: {
      color: '#000000',
      logo: chainsRootnetPNG
    }
  }
];

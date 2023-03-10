// Copyright 2017-2023 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from './types.js';

import { chainsRootnetPNG } from '../ui/logos/chains/index.js';
import { nodesAresOdysseySVG, nodesAutomataPNG, nodesCentrifugePNG, nodesCereSVG, nodesChainxSVG, nodesCompetitorsClubPNG, nodesCrownSterlingPNG, nodesCrustSVG, nodesDatahighwayPNG, nodesDockPNG, nodesEdgewareWhitePNG, nodesEfinitySVG, nodesHanyonycashPNG, nodesHumanodePNG, nodesJoystreamSVG, nodesKulupuSVG, nodesKusariSVG, nodesMathSVG, nodesMinixPNG, nodesNftmartPNG, nodesNodleSVG, nodesPolkadexSVG, nodesPolymeshSVG, nodesRiochainSVG, nodesRobonomicsSVG, nodesSherpaxPNG, nodesSoraSubstrateSVG, nodesStafiPNG, nodesSubgameSVG, nodesSubsocialSVG, nodesSwapdexSVG, nodesTernoaSVG, nodesThebifrostPNG, nodesUniartsPNG, nodesUnitnetworkPNG } from '../ui/logos/nodes/index.js';

export * from './productionRelayKusama.js';
export * from './productionRelayPolkadot.js';

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   providers: The actual hosted secure websocket endpoint
//
// IMPORTANT: Alphabetical based on text
export const prodChains: Omit<EndpointOption, 'teleport'>[] = [
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

// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleDefinition } from '@polkadot/types/types';

import eqDefs from '@equilab/definitions';

import { createCustomAccount, u64FromCurrency } from './equilibrium';

const { genshiro } = eqDefs;

const definitions: OverrideBundleDefinition = {
  derives: {
    ...genshiro.instances.balances.reduce(
      (all, cur) => ({
        ...all,
        [cur]: {
          customAccount: createCustomAccount(cur, (currency: string) => ({ 0: u64FromCurrency(currency) }), 'CompatAccountData')
        }
      }),
      {}
    )
  },

  instances: genshiro.instances,

  types: [
    {
      // on all versions
      minmax: [0, undefined],
      types: genshiro.types
    }
  ]
};

export default definitions;

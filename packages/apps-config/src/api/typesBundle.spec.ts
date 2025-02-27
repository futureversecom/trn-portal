// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';

import { objectSpread } from '@polkadot/util';

import chain from './chain';
import spec from './spec';

it('generates the typesBundle', (): void => {
  const specEntries = Object.entries(spec);
  const chainEntries = Object.entries(chain);
  const typesBundle: { chain: Record<string, unknown>, spec: Record<string, unknown> } = { chain: {}, spec: {} };

  specEntries.forEach(([k, v]): void => {
    const value = objectSpread<{ derives: unknown }>({}, v);

    delete value.derives;

    typesBundle.spec[k] = value;
  });
  // Chain names override anything that spec name might define, if they conflict.
  chainEntries.forEach(([k, v]): void => {
    const value = objectSpread<{ derives: unknown }>({}, v);

    delete value.derives;

    typesBundle.chain[k] = value;
  });

  fs.writeFileSync('packages/apps-config/src/api/typesBundle.ts', `// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Do not edit, auto-generated by @polkadot/apps-config

import type { OverrideBundleType } from '@polkadot/types/types';

/* eslint-disable quotes */
/* eslint-disable quote-props */
/* eslint-disable sort-keys */

export const typesBundle = ${JSON.stringify(typesBundle, null, 2)} as unknown as OverrideBundleType;
`);
});

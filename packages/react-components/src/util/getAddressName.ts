// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringItemType } from '@polkadot/ui-keyring/types';

import { KeyringJson$Meta } from '@polkadot/ui-keyring/types';

import { getAddressMeta } from './getAddressMeta';
// import { toShortAddress } from './toShortAddress';

// isName, isDefault, name
export function getAddressName (address: string, type: KeyringItemType | null = null, defaultName?: string): [boolean, boolean, string] {
  const meta: KeyringJson$Meta = getAddressMeta(address, type);

  return meta.name
    ? [false, false, (meta.name as string).toUpperCase()]
    : defaultName
      ? [false, true, defaultName.toUpperCase()]
      : [true, false, address]; // toShortAddress(address)];
}

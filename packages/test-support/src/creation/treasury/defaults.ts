// Copyright 2017-2024 @polkadot/test-support authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { balanceOf } from '../balance';

export const defaultTreasury = {
  burn: BN_ONE,
  spendPeriod: BN_ZERO,
  value: balanceOf(1)
};

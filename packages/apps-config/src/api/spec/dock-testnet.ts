// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleDefinition } from '@polkadot/types/types';

import types from '@docknetwork/node-types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const definitions = types.spec['dock-test-runtime'] as OverrideBundleDefinition;

export default definitions;

// Copyright 2017-2025 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styledComponents from 'styled-components';

// In styled-components v6, there is a named export which can be used
// directly, i.e. "import { styled } from ..." with no more magic. Until
// such time the cjs vs esm import here is problematic, so we hack around
// the various shapes below
export const styled = (
  (styledComponents as unknown as { styled: typeof styledComponents }).styled ||
  (styledComponents as unknown as { default: typeof styledComponents }).default ||
  styledComponents
);

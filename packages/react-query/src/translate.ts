// Copyright 2017-2025 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseTranslationResponse } from 'react-i18next';

import { useTranslation as useTranslationBase, withTranslation } from 'react-i18next';

export function useTranslation (): UseTranslationResponse<'react-query', undefined> {
  return useTranslationBase('react-query');
}

export default withTranslation(['react-query']);

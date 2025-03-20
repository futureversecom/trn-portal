// Copyright 2017-2025 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useEffect } from 'react';

import { createNamedHook, useApi } from '@polkadot/react-hooks';

/* eslint-disable no-var */

declare global {
  var api: ApiPromise;
}

/*
* Exposes API instance to developer console
*/
function useExposeApiImpl () {
  const { api, isApiReady } = useApi();

  useEffect(() => {
    if (!isApiReady) {
      return;
    }

    global.api = api;
  }, [api, isApiReady]);
}

export const useExposeApi = createNamedHook('useExposeApi', useExposeApiImpl);

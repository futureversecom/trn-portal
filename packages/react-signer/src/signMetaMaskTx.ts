// Copyright 2017-2023 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicEra, Hash, Header, Index, SignerPayload } from '@polkadot/types/interfaces';

import { Web3Provider } from '@ethersproject/providers';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { objectSpread } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';

import { SigningInfo } from './types';

export const signRootTx = async (rootApi: ApiPromise, address: string, ethProvider: Web3Provider, unsignedTx: SubmittableExtrinsic<'promise'>) => {
  const signingInfo: SigningInfo = await rootApi.derive.tx.signingInfo(address);
  const eraOptions = makeEraOptions(rootApi, signingInfo);
  const payload = rootApi.registry.createTypeUnsafe<SignerPayload>('SignerPayload', [
    objectSpread({}, eraOptions, {
      address,
      blockNumber: signingInfo.header ? signingInfo.header.number : 0,
      method: unsignedTx.method,
      version: 4
    })
  ]);
  const { data } = payload.toRaw();
  const hashed = data.length > (256 + 1) * 2 ? blake2AsHex(data) : data;
  const ethPayload = blake2AsHex(hashed);

  if (ethProvider && ethProvider.provider && ethProvider.provider.request) {
    const signature = await ethProvider.provider.request({
      method: 'personal_sign',
      params: [ethPayload, address]
    }) as `0x${string}`;

    unsignedTx.addSignature(address, signature, payload.toPayload());
  }

  return unsignedTx;
};

const makeEraOptions = (rootApi: ApiPromise, signingInfo: SigningInfo) => {
  const { header, mortalLength, nonce } = signingInfo;

  return makeSignOptions(rootApi, {
    blockHash: (header as Header).hash,
    era: rootApi.registry.createTypeUnsafe<ExtrinsicEra>('ExtrinsicEra', [
      {
        current: (header as Header).number,
        period: mortalLength
      }
    ]),
    nonce
  });
};

const makeSignOptions = (rootApi: ApiPromise, extras: { blockHash?: Hash; era?: ExtrinsicEra; nonce?: Index }) => {
  return objectSpread(
    {
      blockHash: rootApi.genesisHash,
      genesisHash: rootApi.genesisHash
    },
    extras,
    {
      runtimeVersion: rootApi.runtimeVersion,
      signedExtensions: rootApi.registry.signedExtensions,
      version: rootApi.extrinsicVersion
    }
  );
};

// Copyright 2017-2025 @polkadot/custom authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SignerOptions } from '@polkadot/api/submittable/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { GenericSignerPayload } from '@polkadot/types';

import { blake2AsHex } from '@polkadot/util-crypto';

export async function signWithEthereumWallet (api: ApiPromise, address: string, extrinsic: SubmittableExtrinsic<'promise'>, options?: Partial<SignerOptions>): Promise<SubmittableExtrinsic<'promise'>> {
  const { header, mortalLength, nonce } = await api.derive.tx.signingInfo(address);
  const eraOptions = {
    address,
    blockHash: header?.hash,
    blockNumber: header?.number,
    era: api.registry.createTypeUnsafe('ExtrinsicEra', [
      {
        current: header?.number,
        period: mortalLength
      }
    ]),
    genesisHash: api.genesisHash,
    method: extrinsic.method,
    nonce,
    runtimeVersion: api.runtimeVersion,
    signedExtensions: api.registry.signedExtensions,
    version: api.extrinsicVersion,
    ...options
  };

  const payload = api.registry.createTypeUnsafe('SignerPayload', [eraOptions]) as unknown as GenericSignerPayload;
  const { data } = payload.toRaw();
  const hashed = data.length > (256 + 1) * 2 ? blake2AsHex(data) : data;
  const ethPayload = blake2AsHex(hashed);

  const signature = await window?.ethereum?.request?.({
    method: 'personal_sign',
    params: [ethPayload, address]
  }) as `0x${string}`;

  extrinsic.addSignature(address, signature, payload.toPayload());

  return extrinsic;
}

// Copyright 2017-2023 @polkadot/app-extrinsics authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { RawParam } from '@polkadot/react-params/types';
import type { DecodedExtrinsic } from './types';

import React, { useCallback, useEffect, useState } from 'react';
import localStore from 'store';

import { Button, Extrinsic, InputAddress, MarkError, TxButton } from '@polkadot/react-components';
import { useApi, useMetaMask } from '@polkadot/react-hooks';
import { BalanceFree } from '@polkadot/react-query';

import Decoded from './Decoded';
import { useTranslation } from './translate';

interface Props {
  className?: string;
  defaultValue: DecodedExtrinsic | null;
}

interface DefaultExtrinsic {
  defaultArgs?: RawParam[];
  defaultFn: SubmittableExtrinsicFunction<'promise'>;
}

function extractDefaults (value: DecodedExtrinsic | null, defaultFn: SubmittableExtrinsicFunction<'promise'>): DefaultExtrinsic {
  if (!value) {
    return { defaultFn };
  }

  return {
    defaultArgs: value.call.args.map((value) => ({
      isValid: true,
      value
    })),
    defaultFn: value.fn
  };
}

function Selection ({ className, defaultValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { apiDefaultTxSudo } = useApi();
  const { connectWallet, wallet } = useMetaMask();
  const [accountId, setAccountId] = useState<string | null>();

  const [isMetaMask, setIsMetaMask] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [{ defaultArgs, defaultFn }] = useState<DefaultExtrinsic>(() => extractDefaults(defaultValue, apiDefaultTxSudo));

  const _onExtrinsicChange = useCallback(
    (method?: SubmittableExtrinsic<'promise'>): void => {
      setExtrinsic(() => method || null);
      connectWallet();
    },
    [connectWallet]
  );

  useEffect((): void => {
    if (wallet.account && isMetaMask && accountId && accountId !== wallet.account) {
      setAddressError(`Please select ${accountId} in your MetaMask wallet`);
    } else {
      setAddressError(null);
    }
  }, [wallet.account, isMetaMask, accountId]);

  const _onExtrinsicError = useCallback(
    (error?: Error | null) =>
      setError(error ? error.message : null),
    []
  );

  useEffect((): void => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const metamaskAccounts: string[] = localStore.get('METAMASK_ACCOUNTS') || [];
    const isMetaMaskAccSelected: string | undefined = metamaskAccounts.find((address: string) => address === accountId);

    setIsMetaMask(!!isMetaMaskAccSelected);
  }, [accountId]);

  return (
    <div className={className}>
      <>
        <InputAddress
          label={t<string>('using the selected account')}
          labelExtra={
            <BalanceFree
              label={<label>{t<string>('free balance')}</label>}
              params={accountId}
            />
          }
          onChange={setAccountId}
          type='account'
        />
        {addressError && (
          <MarkError content={addressError} />
        )}
      </>
      <Extrinsic
        defaultArgs={defaultArgs}
        defaultValue={defaultFn}
        label={t<string>('submit the following extrinsic')}
        onChange={_onExtrinsicChange}
        onError={_onExtrinsicError}
      />
      <Decoded
        extrinsic={extrinsic}
        isCall
      />
      {error && !extrinsic && (
        <MarkError content={error} />
      )}
      <Button.Group>
        <TxButton
          extrinsic={extrinsic}
          icon='sign-in-alt'
          isUnsigned
          label={t<string>('Submit Unsigned')}
          withSpinner
        />
        <TxButton
          accountId={ accountId }
          extrinsic={extrinsic}
          icon='sign-in-alt'
          isMetaMask={isMetaMask}
          label={ isMetaMask ? t<string>('Submit Via Metamask') : t<string>('Submit Transaction')}
        />
      </Button.Group>
    </div>
  );
}

export default React.memo(Selection);

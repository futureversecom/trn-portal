// Copyright 2017-2023 @polkadot/app-extrinsics authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { RawParam } from '@polkadot/react-params/types';
import type { DecodedExtrinsic } from './types';

import React, { useCallback, useEffect, useState } from 'react';

import { AddressRow, Button, Extrinsic, InputAddress, MarkError, TxButton } from '@polkadot/react-components';
import Dropdown from '@polkadot/react-components/Dropdown';
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
  const [metamaskAccountId, setMetaMaskAccountId] = useState<string | null>();
  const [signMethod, setSignMethod] = useState<string>('MetaMask');

  const [error, setError] = useState<string | null>(null);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [{ defaultArgs, defaultFn }] = useState<DefaultExtrinsic>(() => extractDefaults(defaultValue, apiDefaultTxSudo));
  const options = [{ text: 'MetaMask', value: 'MetaMask' }, { text: 'Keyring Signer', value: 'Signer' }];

  const _onExtrinsicChange = useCallback(
    (method?: SubmittableExtrinsic<'promise'>): void => {
      setExtrinsic(() => method || null);
      connectWallet();

      if (wallet.account) {
        setMetaMaskAccountId(wallet.account);
      }
    },
    [connectWallet, wallet.account]
  );

  useEffect((): void => {
    if (wallet.account) {
      setMetaMaskAccountId(wallet.account);
    }
  }, [wallet.account]);

  const _onExtrinsicError = useCallback(
    (error?: Error | null) =>
      setError(error ? error.message : null),
    []
  );

  return (
    <div className={className}>
      <Dropdown
        className={`ui--DropdownLinked-Items ${className as string}`}
        label={t<string>('Select Signer')}
        onChange={setSignMethod}
        options={options}
        value={signMethod}
        withLabel={true}
      />
      {
        (signMethod === 'MetaMask'
          ? (
            <AddressRow
              value={metamaskAccountId}
            />

          )
          : (
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
            </>))
      }
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
          accountId={ signMethod === 'MetaMask' ? metamaskAccountId : accountId }
          extrinsic={extrinsic}
          icon='sign-in-alt'
          isMetaMask={ signMethod === 'MetaMask' ? true : undefined }
          label={ signMethod === 'MetaMask' ? t<string>('Submit Via Metamask') : t<string>('Submit Transaction')}
        />
      </Button.Group>
    </div>
  );
}

export default React.memo(Selection);

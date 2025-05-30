// Copyright 2017-2025 @polkadot/app-addresses authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { ModalProps as Props } from '../types.js';

import React, { useCallback, useMemo, useState } from 'react';

import { AddressRow, Button, Input, InputAddress, Modal } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a } from '@polkadot/util';
import { ethereumEncode } from '@polkadot/util-crypto';

import { useTranslation } from '../translate.js';

interface AddrState {
  address: string;
  addressInput: string;
  isAddressExisting: boolean;
  isAddressValid: boolean;
  isPublicKey: boolean;
}

interface NameState {
  isNameValid: boolean;
  name: string;
}

function Create ({ onClose, onStatusChange }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, isEthereum } = useApi();
  const [{ isNameValid, name }, setName] = useState<NameState>({ isNameValid: false, name: '' });
  const [{ address, addressInput, isAddressExisting, isAddressValid }, setAddress] = useState<AddrState>({ address: '', addressInput: '', isAddressExisting: false, isAddressValid: false, isPublicKey: false });
  const info = useCall<DeriveAccountInfo>(!!address && isAddressValid && api.derive.accounts.info, [address]);
  const isValid = useMemo(() => (isAddressValid && isNameValid) && !!info?.accountId, [isAddressValid, isNameValid, info]);

  const _onChangeAddress = useCallback(
    (addressInput: string): void => {
      let address = '';
      let isAddressValid = true;
      let isAddressExisting = false;
      let isPublicKey = false;

      try {
        if (isEthereum) {
          const rawAddress = hexToU8a(addressInput);

          address = ethereumEncode(rawAddress);
          isPublicKey = rawAddress.length === 20;
        } else {
          const publicKey = keyring.decodeAddress(addressInput);

          address = keyring.encodeAddress(publicKey);
          isPublicKey = publicKey.length === 32;
        }

        if (!isAddressValid) {
          const old = keyring.getAddress(address);

          if (old) {
            const newName: string = old.meta.name! || name;

            isAddressExisting = true;
            isAddressValid = true;
            setName({ isNameValid: !!(newName || '').trim(), name: newName });
          }
        }
      } catch {
        isAddressValid = false;
      }

      setAddress({ address: isAddressValid ? address : '', addressInput, isAddressExisting, isAddressValid, isPublicKey });
    },
    [isEthereum, name]
  );

  const _onChangeName = useCallback(
    (name: string) => setName({ isNameValid: !!name.trim(), name }),
    []
  );

  const _onCommit = useCallback(
    (): void => {
      const status = { action: 'create' } as ActionStatus;

      if (!isValid || !info?.accountId) {
        return;
      }

      try {
        const address = info.accountId.toString();

        keyring.saveAddress(address, { genesisHash: keyring.genesisHash, name: name.trim(), tags: [] });

        status.account = address;
        status.status = address ? 'success' : 'error';
        status.message = isAddressExisting
          ? t('address edited')
          : t('address created');

        InputAddress.setLastValue('address', address);
      } catch (error) {
        status.status = 'error';
        status.message = (error as Error).message;
      }

      onStatusChange(status);
      onClose();
    },
    [info, isAddressExisting, isValid, name, onClose, onStatusChange, t]
  );

  return (
    <Modal
      header={t('Add an address')}
      onClose={onClose}
    >
      <Modal.Content>
        <AddressRow
          defaultName={name}
          noDefaultNameOpacity
          value={
            isAddressValid
              ? info?.accountId?.toString()
              : undefined
          }
        >
          <Input
            autoFocus
            className='full'
            isError={!isAddressValid}
            label={t('address')}
            onChange={_onChangeAddress}
            onEnter={_onCommit}
            placeholder={t('new address')}
            value={addressInput}
          />
          <Input
            className='full'
            isError={!isNameValid}
            label={t('name')}
            onChange={_onChangeName}
            onEnter={_onCommit}
            value={name}
          />
        </AddressRow>
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='save'
          isDisabled={!isValid}
          label={t('Save')}
          onClick={_onCommit}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(Create);

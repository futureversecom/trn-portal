// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SessionInfo } from '../partials/types';

import React, { useEffect, useState } from 'react';

import { MarkError, Modal, TxButton } from '@polkadot/react-components';
import { useMetaMask } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate';
import SessionKeyPartital from '../partials/SessionKey';

interface Props {
  controllerId: string;
  onClose: () => void;
  isMetaMask?: boolean
  stashId: string;
}

function SetSessionKey ({ controllerId, isMetaMask, onClose, stashId }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const [{ sessionTx }, setTx] = useState<SessionInfo>({});
  const { wallet } = useMetaMask();
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect((): void => {
    if (wallet.account && isMetaMask && controllerId !== wallet.account) {
      setAddressError(`Please select ${controllerId} in your MetaMask wallet`);
    } else {
      setAddressError(null);
    }
  }, [wallet.account, isMetaMask, controllerId]);

  return (
    <Modal
      header={t<string>('Set Session Key')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        <SessionKeyPartital
          controllerId={controllerId}
          onChange={setTx}
          stashId={stashId}
          withFocus
          withSenders
        />
      </Modal.Content>
      <Modal.Actions>
        {addressError && (
          <MarkError content={addressError} />
        )}
        <TxButton
          accountId={controllerId}
          extrinsic={sessionTx}
          icon='sign-in-alt'
          isDisabled={!sessionTx || !!addressError}
          isMetaMask={isMetaMask}
          label={t<string>('Set Session Key')}
          onStart={onClose}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(SetSessionKey);

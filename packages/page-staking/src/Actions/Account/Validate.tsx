// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { ValidateInfo } from '../partials/types';

import React, { useEffect, useState } from 'react';

import { MarkError, Modal, TxButton } from '@polkadot/react-components';
import { useMetaMask } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate';
import ValidatePartial from '../partials/Validate';

interface Props {
  controllerId: string;
  isMetaMask?: boolean;
  minCommission?: BN;
  onClose: () => void;
  stashId: string;
}

function Validate ({ controllerId, isMetaMask, minCommission, onClose, stashId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [{ validateTx }, setTx] = useState<ValidateInfo>({});
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
      header={t<string>('Set validator preferences')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        <ValidatePartial
          controllerId={controllerId}
          minCommission={minCommission}
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
          extrinsic={validateTx}
          icon='certificate'
          isDisabled={!validateTx || !!addressError}
          isMetaMask={isMetaMask}
          label={t<string>('Validate')}
          onStart={onClose}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(Validate);

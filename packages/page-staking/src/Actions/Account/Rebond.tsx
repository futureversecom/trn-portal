// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveStakingAccount } from '@polkadot/api-derive/types';

import React, { useEffect, useMemo, useState } from 'react';

import { InputBalance, MarkError, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useMetaMask } from '@polkadot/react-hooks';
import { BN, BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../../translate';
import SenderInfo from '../partials/SenderInfo';

interface Props {
  controllerId: string | null;
  onClose: () => void;
  stakingInfo?: DeriveStakingAccount;
  stashId: string;
  isMetaMask?: boolean
}

// TODO we should check that the bonded amoutn, after the operation is >= ED
function Rebond ({ controllerId, isMetaMask, onClose, stakingInfo, stashId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [maxAdditional, setMaxAdditional] = useState<BN | undefined>();
  const { wallet } = useMetaMask();
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect((): void => {
    if (wallet.account && isMetaMask && controllerId && controllerId !== wallet.account) {
      setAddressError(`Please select ${controllerId} in your MetaMask wallet`);
    } else {
      setAddressError(null);
    }
  }, [wallet.account, isMetaMask, controllerId]);

  const startBalance = useMemo(
    () => stakingInfo && stakingInfo.unlocking
      ? stakingInfo.unlocking.reduce((total, { value }) => total.iadd(value), new BN(0))
      : BN_ZERO,
    [stakingInfo]
  );

  return (
    <Modal
      header= {t<string>('Bond more funds')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        <SenderInfo
          controllerId={controllerId}
          stashId={stashId}
        />
        {startBalance && (
          <Modal.Columns hint={t<string>('The amount the is to be rebonded from the value currently unlocking, i.e. previously unbonded')}>
            <InputBalance
              autoFocus
              defaultValue={startBalance}
              isError={!maxAdditional || maxAdditional.eqn(0) || maxAdditional.gt(startBalance)}
              label={t<string>('rebonded amount')}
              onChange={setMaxAdditional}
            />
          </Modal.Columns>
        )}
      </Modal.Content>
      <Modal.Actions>
        {addressError && (
          <MarkError content={addressError} />
        )}
        <TxButton
          accountId={controllerId}
          icon='sign-in-alt'
          isDisabled={!maxAdditional || maxAdditional.isZero() || !startBalance || maxAdditional.gt(startBalance) || !!addressError}
          isMetaMask={isMetaMask}
          label={t<string>('Rebond')}
          onStart={onClose}
          params={[maxAdditional]}
          tx={api.tx.staking.rebond}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(Rebond);

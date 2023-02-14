// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { SortedTargets } from '../../types';
import type { NominateInfo } from '../partials/types';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { MarkError, Modal, TxButton } from '@polkadot/react-components';
import { useMetaMask } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate';
import NominatePartial from '../partials/Nominate';

interface Props {
  className?: string;
  controllerId: string;
  isMetaMask?: boolean
  nominating?: string[];
  onClose: () => void;
  poolId?: BN;
  stashId: string;
  targets: SortedTargets;
}

function Nominate ({ className = '', controllerId, isMetaMask, nominating, onClose, poolId, stashId, targets }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const [{ nominateTx }, setTx] = useState<NominateInfo>({});
  const { wallet } = useMetaMask();
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect((): void => {
    if (wallet.account && isMetaMask && controllerId !== wallet.account) {
      setAddressError(`Please select ${controllerId} in your MetaMask wallet`);
    } else {
      setAddressError(null);
    }
  }, [wallet.account, isMetaMask, controllerId]);

  const isDisabled = !nominateTx || !!addressError;

  return (
    <StyledModal
      className={className}
      header={t<string>('Nominate Validators')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        <NominatePartial
          className='nominatePartial'
          controllerId={controllerId}
          nominating={nominating}
          onChange={setTx}
          poolId={poolId}
          stashId={stashId}
          targets={targets}
          withSenders
        />
      </Modal.Content>
      <Modal.Actions>
        {addressError && (
          <MarkError content={addressError} />
        )}
        <TxButton
          accountId={controllerId}
          extrinsic={nominateTx}
          icon='hand-paper'
          isDisabled={isDisabled}
          isMetaMask={isMetaMask}
          label={t<string>('Nominate')}
          onStart={onClose}
        />
      </Modal.Actions>
    </StyledModal>
  );
}

const StyledModal = styled(Modal)`
  .nominatePartial {
    .ui--Static .ui--AddressMini .ui--AddressMini-info {
      max-width: 10rem;
      min-width: 10rem;
    }
  }
`;

export default React.memo(Nominate);

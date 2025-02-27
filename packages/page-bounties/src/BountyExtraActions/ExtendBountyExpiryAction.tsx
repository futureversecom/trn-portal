// Copyright 2017-2025 @polkadot/app-treasury authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, BountyIndex } from '@polkadot/types/interfaces';

import React, { useCallback, useMemo, useState } from 'react';

import { Input, InputAddress, Modal, TxButton } from '@polkadot/react-components';
import { useBlockTime } from '@polkadot/react-hooks';

import { truncateTitle } from '../helpers';
import { increaseDateByBlocks } from '../helpers/increaseDateByBlocks';
import { useBounties } from '../hooks';
import { useTranslation } from '../translate';

interface Props {
  curatorId: AccountId;
  description: string
  index: BountyIndex;
  toggleOpen: () => void;
}

function ExtendBountyExpiryAction ({ curatorId, description, index, toggleOpen }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { bountyUpdatePeriod, extendBountyExpiry } = useBounties();
  const [remark, setRemark] = useState('');
  const [blockTime, timeAsText] = useBlockTime(bountyUpdatePeriod);

  const onRemarkChange = useCallback((value: string) => {
    setRemark(value);
  }, []);

  const expiryDate = useMemo(() => bountyUpdatePeriod && increaseDateByBlocks(bountyUpdatePeriod, blockTime), [bountyUpdatePeriod, blockTime]);

  return (
    <>
      <Modal
        header={`${t<string>('extend expiry')} - "${truncateTitle(description, 30)}"`}
        onClose={toggleOpen}
        size='large'
      >
        <Modal.Content>
          <Modal.Columns hint={t<string>('Only curator can extend the bounty time.')}>
            <InputAddress
              isDisabled
              label={t<string>('curator account')}
              type='account'
              value={curatorId.toString()}
              withLabel
            />
          </Modal.Columns>
          {expiryDate &&
            <Modal.Columns hint={t<string>(`Bounty expiry time will be set to ${timeAsText} from now.`)}>
              <Input
                isDisabled
                label={t<string>('new expiry date and time')}
                value={`${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString()}`}
              />
            </Modal.Columns>
          }
          <Modal.Columns hint={t<string>("The note that will be added to the transaction. It won't be stored on chain")}>
            <Input
              autoFocus
              defaultValue={''}
              label={t<string>('bounty remark')}
              onChange={onRemarkChange}
              value={remark}
            />
          </Modal.Columns>
        </Modal.Content>
        <Modal.Actions>
          <TxButton
            accountId={curatorId}
            icon='check'
            label={t<string>('Accept')}
            onStart={toggleOpen}
            params={[index, remark]}
            tx={extendBountyExpiry}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default React.memo(ExtendBountyExpiryAction);

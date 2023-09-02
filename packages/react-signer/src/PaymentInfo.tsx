// Copyright 2017-2023 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Something is seriously going wrong here...
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { RuntimeDispatchInfo } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { useFeeAssetBalance } from '@polkadot/custom/src/hooks/useFeeAssetBalance';
import { Expander, MarkWarning } from '@polkadot/react-components';
import { useApi, useIsMountedRef } from '@polkadot/react-hooks';
import { nextTick } from '@polkadot/util';

import { useTranslation } from './translate.js';

interface Props {
  accountId?: string | null;
  className?: string;
  extrinsic?: SubmittableExtrinsic | null;
  isHeader?: boolean;
  onChange?: (hasAvailable: boolean) => void;
  tip?: BN;
}

function PaymentInfo ({ accountId, className = '', extrinsic, isHeader }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const [dispatchInfo, setDispatchInfo] = useState<RuntimeDispatchInfo | null>(null);
  const mountedRef = useIsMountedRef();
  const [feeAsset, feeAssetBalance, formatFeeBalance] = useFeeAssetBalance(accountId);

  useEffect((): void => {
    accountId && extrinsic && extrinsic.hasPaymentInfo &&
      nextTick(async (): Promise<void> => {
        try {
          const info = await extrinsic.paymentInfo(accountId);

          mountedRef.current && setDispatchInfo(info);
        } catch (error) {
          console.error(error);
        }
      });
  }, [api, accountId, extrinsic, mountedRef]);

  if (!dispatchInfo || !extrinsic) {
    return null;
  }

  const isFeeError = feeAsset && feeAssetBalance?.lte(dispatchInfo.partialFee);

  return (
    <>
      <Expander
        className={className}
        isHeader={isHeader}
        summary={
          <Trans i18nKey='feesForSubmission'>
            Fees of <span className='highlight'>{formatFeeBalance(dispatchInfo.partialFee)}</span> will be applied to the submission
          </Trans>
        }
      />
      {isFeeError && (
        <MarkWarning content={t('The account does not have enough free funds (excluding locked/bonded/reserved) available to cover the transaction fees without dropping the balance below the account existential amount.')} />
      )}
    </>
  );
}

export default React.memo(PaymentInfo);

// Copyright 2017-2025 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { RuntimeDispatchInfo } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { useFeeAssetBalance } from '@trnsp/custom/hooks/useFeeAssetBalance';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { Expander, MarkWarning } from '@polkadot/react-components';
import { useApi, useIsMountedRef } from '@polkadot/react-hooks';
import { nextTick } from '@polkadot/util';

import { useTranslation } from './translate';

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
        <MarkWarning content={t<string>('The account does not have enough free funds (excluding locked/bonded/reserved) available to cover the transaction fees without dropping the balance below the account existential amount.')} />
      )}
    </>
  );
}

export default React.memo(PaymentInfo);

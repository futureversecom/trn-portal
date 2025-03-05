// Copyright 2017-2025 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { QueueTx } from '@polkadot/react-components/Status/types';
import type { BN } from '@polkadot/util';
import type { AddressProxy } from './types.js';

import React, { useCallback, useEffect, useState } from 'react';

import { Button, ErrorBoundary, Modal, Output, styled } from '@polkadot/react-components';
import { useApi, useQueue, useToggle } from '@polkadot/react-hooks';
import Address from '@polkadot/react-signer/Address';
import Tip from '@polkadot/react-signer/Tip';
import Transaction from '@polkadot/react-signer/Transaction';
import { handleTxResults } from '@polkadot/react-signer/util';
import { nextTick, u8aToHex } from '@polkadot/util';

import { signWithEthereumWallet } from './signers/signWithEthereumWallet.js';
import { useTranslation } from './translate.js';

interface Props {
  className?: string;
  currentItem: QueueTx;
  requestAddress: string | null;
}

interface InnerTx {
  innerHash: string | null;
  innerTx: string | null;
}

const EMPTY_INNER: InnerTx = { innerHash: null, innerTx: null };
const NOOP = () => undefined;

function TxSigned ({ className, currentItem, requestAddress }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const { queueSetTxStatus } = useQueue();
  const [error, setError] = useState<Error | null>(null);
  const [isBusy, setBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isRenderError, toggleRenderError] = useToggle();
  const [senderInfo, setSenderInfo] = useState<AddressProxy>(() => ({ isMultiCall: false, isUnlockCached: false, multiRoot: null, proxyRoot: null, signAddress: requestAddress, signPassword: '' }));
  const [{ innerHash }, setCallInfo] = useState<InnerTx>(EMPTY_INNER);
  const [tip, setTip] = useState<BN | undefined>();

  // when we are sending the hash only, get the wrapped call for display (proxies if required)
  useEffect((): void => {
    const method = currentItem.extrinsic && (
      senderInfo.proxyRoot
        ? api.tx.proxy.proxy(senderInfo.proxyRoot, null, currentItem.extrinsic)
        : currentItem.extrinsic
    ).method;

    setCallInfo(
      method
        ? {
          innerHash: method.hash.toHex(),
          innerTx: senderInfo.multiRoot
            ? method.toHex()
            : null
        }
        : EMPTY_INNER
    );
  }, [api, currentItem, senderInfo]);

  const _doStart = useCallback(
    (): void => {
      setBusy(true);
      nextTick(async () => {
        const errorHandler = (error: Error): void => {
          console.error(error);

          setBusy(false);
          setError(error);
        };

        const externalErrorHandler = (message: string): void => {
          setBusy(false);
          setPasswordError(message);
        };

        if (!senderInfo.signAddress) {
          return setError(new Error(`Invalid signing address: ${JSON.stringify(senderInfo.signAddress)}`));
        }

        if (!currentItem.extrinsic) {
          return setError(new Error(`Invalid extrinsic: ${currentItem.id}`));
        }

        try {
          const signedExtrinsic = await signWithEthereumWallet(api, senderInfo.signAddress, currentItem.extrinsic, { tip });
          const signature = u8aToHex(signedExtrinsic.signature);

          queueSetTxStatus(currentItem.id, 'sending');

          if (signedExtrinsic.send) {
            currentItem.txStartCb && currentItem.txStartCb();
            const unsubscribe: () => void = await signedExtrinsic.send(handleTxResults('signAndSend', queueSetTxStatus, currentItem, () => unsubscribe()));
          } else {
            const { id, signerCb = NOOP } = currentItem;

            signerCb(id, { id, signature });
          }
        } catch (error) {
          queueSetTxStatus(currentItem.id, 'error', null, error as Error);
          const { code, message } = error as {code: number, message: string};

          if (code) {
            return externalErrorHandler(`${code}: ${message}`);
          }

          errorHandler(error as Error);
        }
      });
    },
    [api, currentItem, queueSetTxStatus, senderInfo.signAddress, tip]
  );

  return (
    <>
      <StyledModalContent className={className}>
        <ErrorBoundary
          error={error}
          onError={toggleRenderError}
        >
          <Transaction
            accountId={senderInfo.signAddress}
            currentItem={currentItem}
            onError={toggleRenderError}
          />
          <Address
            currentItem={currentItem}
            onChange={setSenderInfo}
            onEnter={_doStart}
            passwordError={passwordError}
            requestAddress={requestAddress}
          />
          {!currentItem.payload && (
            <Tip onChange={setTip} />
          )}
          {innerHash && (
            <Modal.Columns hint={t('The call hash as calculated for this transaction')}>
              <Output
                isDisabled
                isTrimmed
                label={t('call hash')}
                value={innerHash}
                withCopy
              />
            </Modal.Columns>
          )}
        </ErrorBoundary>
      </StyledModalContent>
      <Modal.Actions>
        <Button
          icon='sign-in-alt'
          isBusy={isBusy}
          isDisabled={!senderInfo.signAddress || isRenderError}
          label={t('Sign and Submit')}
          onClick={_doStart}
          tabIndex={2}
        />
      </Modal.Actions>
    </>
  );
}

const StyledModalContent = styled(Modal.Content)`
  .tipToggle {
    width: 100%;
    text-align: right;
  }

  .ui--Checks {
    margin-top: 0.75rem;
  }
`;

export default React.memo(TxSigned);

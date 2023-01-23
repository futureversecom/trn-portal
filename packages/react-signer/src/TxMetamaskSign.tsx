// Copyright 2017-2023 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { QueueTx } from '@polkadot/react-components/Status/types';
import type { AddressProxy } from './types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button, ErrorBoundary, Modal, Output, StatusContext } from '@polkadot/react-components';
import { useApi, useMetaMask, useToggle } from '@polkadot/react-hooks';
import { nextTick } from '@polkadot/util';

import Address from './Address';
import Transaction from './Transaction';
import { useTranslation } from './translate';
import { handleTxResults } from './util';
import {signRootTx} from "@polkadot/react-signer/signMetaMaskTx";
import {Web3Provider} from "@ethersproject/providers";
import {SubmittableExtrinsic} from "@polkadot/api/types";

interface Props {
  className?: string;
  currentItem: QueueTx;
  requestAddress: string;
}

interface InnerTx {
  innerHash: string | null;
  innerTx: string | null;
}

const EMPTY_INNER: InnerTx = { innerHash: null, innerTx: null };



function TxSigned ({ className, currentItem, requestAddress }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const { queueSetTxStatus } = useContext(StatusContext);
  const [error] = useState<Error | null>(null);
  const [isBusy, setBusy] = useState(false);
  const [isRenderError, toggleRenderError] = useToggle();
  const [isSubmit] = useState(true);
  const [senderInfo, setSenderInfo] = useState<AddressProxy>(() => ({ isMultiCall: false, isUnlockCached: false, multiRoot: null, proxyRoot: null, signAddress: requestAddress, signPassword: '' }));
  const [{ innerHash }, setCallInfo] = useState<InnerTx>(EMPTY_INNER);
  const { wallet, provider } = useMetaMask();

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
      nextTick((): void => {
        const {extrinsic} = currentItem;
        signRootTx(api, wallet.account as string, provider as Web3Provider, extrinsic as SubmittableExtrinsic<"promise">).then(async (signedExtrinsic) => {
          queueSetTxStatus(currentItem.id, 'sending');

          const unsubscribe = await signedExtrinsic.send(handleTxResults('signAndSend', queueSetTxStatus, currentItem, (): void => {
            unsubscribe();
          }));
        });

      });
    },
    [ currentItem, isSubmit, queueSetTxStatus, senderInfo]
  );
  return (
    <>
      <Modal.Content className={className}>
        <ErrorBoundary
          error={error}
          onError={toggleRenderError}
        >
              <>
                <Transaction
                  accountId={senderInfo.signAddress}
                  currentItem={currentItem}
                  onError={toggleRenderError}
                />
                <Address
                  currentItem={currentItem}
                  onChange={setSenderInfo}
                  onEnter={_doStart}
                  passwordError={null}
                  requestAddress={requestAddress}
                />
                {isSubmit && innerHash && (
                  <Modal.Columns hint={t('The call hash as calculated for this transaction')}>
                    <Output
                      isDisabled
                      isTrimmed
                      label={t<string>('call hash')}
                      value={innerHash}
                      withCopy
                    />
                  </Modal.Columns>
                )}
              </>
        </ErrorBoundary>


      </Modal.Content>
      <Modal.Actions>
        <Button
          icon={'sign-in-alt'}
          isBusy={isBusy}
          isDisabled={!senderInfo.signAddress || isRenderError}
          label={
              t<string>('Sign via Metamask')
          }
          onClick={_doStart}
          tabIndex={2}
        />
      </Modal.Actions>
    </>
  );
}

export default React.memo(styled(TxSigned)`
  .tipToggle {
    width: 100%;
    text-align: right;
  }

  .ui--Checks {
    margin-top: 0.75rem;
  }
`);

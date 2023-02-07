// Copyright 2017-2023 @polkadot/app-settings authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { createLanguages } from '@polkadot/apps-config';
import { Button, Dropdown, MarkWarning } from '@polkadot/react-components';
import { useApi, useLedger } from '@polkadot/react-hooks';
import { settings } from '@polkadot/ui-settings';

import { useTranslation } from './translate';
import { save, saveAndReload } from './util';

interface Props {
  className?: string;
}

const _ledgerConnOptions = settings.availableLedgerConn;

function General ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isElectron } = useApi();
  const { hasLedgerChain, hasWebUsb } = useLedger();
  // tri-state: null = nothing changed, false = no reload, true = reload required
  const [changed, setChanged] = useState<boolean | null>(null);
  const [state, setSettings] = useState((): SettingsStruct => {
    let values = settings.get();

    // Default to dark theme
    values = { ...values, uiTheme: 'dark' };

    settings.set(values);

    return values;
  });

  const ledgerConnOptions = useMemo(
    () => _ledgerConnOptions.filter(({ value }) => !isElectron || value !== 'webusb'),
    [isElectron]
  );

  const themeOptions = useMemo(
    () => [
      { text: t('Light theme'), value: 'light' },
      { text: t('Dark theme'), value: 'dark' }
    ],
    [t]
  );

  const translateLanguages = useMemo(
    () => createLanguages(t),
    [t]
  );

  useEffect((): void => {
    const prev = settings.get() as unknown as Record<string, unknown>;
    const hasChanges = Object.entries(state).some(([key, value]) => prev[key] !== value);
    const needsReload = prev.apiUrl !== state.apiUrl || prev.prefix !== state.prefix;

    setChanged(
      hasChanges
        ? needsReload
        : null
    );
  }, [state]);

  const _handleChange = useCallback(
    (key: keyof SettingsStruct) => <T extends string | number>(value: T) =>
      setSettings((state) => ({ ...state, [key]: value })),
    []
  );

  const _saveAndReload = useCallback(
    () => saveAndReload(state),
    [state]
  );

  const _save = useCallback(
    (): void => {
      save(state);
      setChanged(null);
    },
    [state]
  );

  const { i18nLang, ledgerConn, uiTheme } = state;

  return (
    <div className={className}>
      <div className='ui--row'>
        <Dropdown
          defaultValue={uiTheme}
          label={t<string>('default interface theme')}
          onChange={_handleChange('uiTheme')}
          options={themeOptions}
        />
      </div>
      <div className='ui--row'>
        <Dropdown
          defaultValue={i18nLang}
          label={t<string>('default interface language')}
          onChange={_handleChange('i18nLang')}
          options={translateLanguages}
        />
      </div>
      {hasLedgerChain && (
        <>
          <div className='ui--row'>
            <Dropdown
              defaultValue={
                hasWebUsb
                  ? ledgerConn
                  : ledgerConnOptions[0].value
              }
              isDisabled={!hasWebUsb}
              label={t<string>('manage hardware connections')}
              onChange={_handleChange('ledgerConn')}
              options={ledgerConnOptions}
            />
          </div>
          {hasWebUsb
            ? state.ledgerConn !== 'none'
              ? (
                <div className='ui--row'>
                  <MarkWarning content={t<string>('Ledger support is still experimental and some issues may remain. Trust, but verify the addresses on your devices before transferring large amounts. There are some features that will not work, including batch calls (used extensively in staking and democracy) as well as any identity operations.')} />
                </div>
              )
              : null
            : (
              <MarkWarning content={t<string>('Ledger hardware device support is only available on Chromium-based browsers where WebUSB and WebHID support is available in the browser.')} />
            )
          }
        </>
      )}
      <Button.Group>
        <Button
          icon='save'
          isDisabled={changed === null}
          label={
            changed
              ? t<string>('Save & Reload')
              : t<string>('Save')
          }
          onClick={
            changed
              ? _saveAndReload
              : _save
          }
        />
      </Button.Group>
    </div>
  );
}

export default React.memo(General);

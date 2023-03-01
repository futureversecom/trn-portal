// Copyright 2017-2023 @polkadot/app-settings authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { createLanguages } from '@polkadot/apps-config';
import { Button, Dropdown } from '@polkadot/react-components';
import { settings } from '@polkadot/ui-settings';

import { useTranslation } from './translate';
import { save, saveAndReload } from './util';

interface Props {
  className?: string;
}

function General ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  // tri-state: null = nothing changed, false = no reload, true = reload required
  const [changed, setChanged] = useState<boolean | null>(null);
  const [state, setSettings] = useState((): SettingsStruct => {
    const values = settings.get();

    return { ...values, uiTheme: values.uiTheme === 'dark' ? 'dark' : 'light' };
  });

  const themeOptions = useMemo(
    () => [
      { text: t<string>('Light theme'), value: 'light' },
      { text: t<string>('Dark theme'), value: 'dark' }
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

  return (
    <div className={className}>
      <h1>{t<string>('UI options')}</h1>
      <div className='ui--row'>
        <Dropdown
          defaultValue={state.uiTheme}
          label={t<string>('default interface theme')}
          onChange={_handleChange('uiTheme')}
          options={themeOptions}
        />
      </div>
      <div className='ui--row'>
        <Dropdown
          defaultValue={state.i18nLang}
          label={t<string>('default interface language')}
          onChange={_handleChange('i18nLang')}
          options={translateLanguages}
        />
      </div>
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

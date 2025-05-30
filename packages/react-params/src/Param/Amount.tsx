// Copyright 2017-2025 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BitLength } from '@polkadot/react-components/types';
import type { Registry, TypeDef } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Props } from '../types.js';

import React, { useCallback, useMemo } from 'react';

import { Input, InputNumber } from '@polkadot/react-components';
import { bnToBn, formatBalance, formatNumber, isUndefined } from '@polkadot/util';

import Bare from './Bare.js';

function getBitLength (registry: Registry, { type }: TypeDef): BitLength {
  try {
    return registry.createType(type as 'u32').bitLength() as BitLength;
  } catch {
    return 32;
  }
}

function Amount ({ className = '', defaultValue: { value }, isDisabled, isError, label, onChange, onEnter, registry, type, withLabel }: Props): React.ReactElement<Props> {
  const isSigned = useMemo(
    // Allow signed inputs for i{8, 16, 32, 64, 128, ...} types
    () => /^i\d*$/.test(type.type),
    [type]
  );

  const defaultValue = useMemo(
    () => {
      const feeOptions = { decimals: 6, forceUnit: '-', withAll: true, withSi: true, withUnit: 'XRP' };

      if (isDisabled) {
        if (value instanceof registry.createClass('AccountIndex')) {
          return value.toString();
        } else if (label === 'actualFee: u128' || label === 'tip: u128') {
          return formatBalance(value as number, feeOptions);
        } else {
          return formatNumber(value as number);
        }
      } else {
        return bnToBn((value as number) || 0).toString();
      }
    }, [isDisabled, registry, value, label]
  );

  const bitLength = useMemo(
    () => getBitLength(registry, type),
    [registry, type]
  );

  const _onChange = useCallback(
    (value?: BN) =>
      onChange && onChange({
        isValid: !isUndefined(value),
        value
      }),
    [onChange]
  );

  return (
    <Bare className={className}>
      {isDisabled
        ? (
          <Input
            className='full'
            defaultValue={defaultValue}
            isDisabled
            label={label}
            withEllipsis
            withLabel={withLabel}
          />
        )
        : (
          <InputNumber
            bitLength={bitLength}
            className='full'
            defaultValue={defaultValue}
            isError={isError}
            isSigned={isSigned}
            isZeroable
            label={label}
            onChange={_onChange}
            onEnter={onEnter}
            withLabel={withLabel}
          />
        )
      }
    </Bare>
  );
}

export default React.memo(Amount);

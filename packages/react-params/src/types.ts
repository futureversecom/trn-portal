// Copyright 2017-2025 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Option, u32, Vec } from '@polkadot/types';
import type { H256 } from '@polkadot/types/interfaces';
import type { BlockHash } from '@polkadot/types/interfaces/chain';
import type { EthAddress, EthBloom, EthLog } from '@polkadot/types/interfaces/eth/types';
import type { Registry, TypeDef } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

// FIXME Ideally, we want these as Base from api-codec - as a stop-gap, any this until we have
// params returning types extending Base (i.e. anything from api-codec)
export type RawParamValue = unknown;

export interface RawParam {
  isValid: boolean;
  value: RawParamValue;
}

export interface RawParamOnChangeValue {
  isValid: boolean;
  value: RawParamValue;
}

export type RawParamOnChange = (value: RawParamOnChangeValue) => void;
export type RawParamOnEnter = () => void;
export type RawParamOnEscape = () => void;

export type RawParams = RawParam[];

export interface Props {
  className?: string;
  defaultValue: RawParam;
  isDisabled?: boolean;
  isError?: boolean;
  isInOption?: boolean;
  isReadOnly?: boolean;
  isOptional?: boolean;
  label?: React.ReactNode;
  name?: string;
  onChange?: RawParamOnChange;
  onEnter?: RawParamOnEnter;
  onEscape?: RawParamOnEscape;
  // eslint-disable-next-line no-use-before-define
  overrides?: ComponentMap;
  registry: Registry;
  type: TypeDefExt;
  withLabel?: boolean;
  withLength?: boolean;
}

export type Size = 'full' | 'large' | 'medium' | 'small';

export type ComponentMap = Record<string, React.ComponentType<Props>>;

export interface ParamDef {
  length?: number;
  name?: string;
  type: TypeDef;
}

export interface ExpandedCid {
  codec: number;
  hash: {
    code: number;
    digest: HexString;
  };
  version: 0 | 1;
}

export interface TypeDefExt extends TypeDef {
  withOptionActive?: boolean;
}

export interface BlockEVMEvent {
  transactionHash: H256;
  readonly transactionIndex: u32;
  readonly from: EthAddress;
  readonly to: Option<EthAddress>;
  readonly contractAddress: Option<EthAddress>;
  readonly logs: Vec<EthLog>;
  readonly logsBloom: EthBloom;
  blockHash?: BlockHash;
  blockNumber?: Option<u32>;
}

/* eslint-disable header/header */
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { EthAddress, EthBloom, EthLog } from '@polkadot/types/interfaces/eth/types';
import { H256 } from '@polkadot/types/interfaces/runtime';
import { Option, u32, Vec } from '@polkadot/types-codec';

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

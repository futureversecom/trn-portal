// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleDefinition } from '@polkadot/types/types';

// structs need to be in order
/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const definitions: OverrideBundleDefinition = {
  types: [
    {
      // on all versions
      minmax: [0, undefined],
      types: {
        AccountId: 'EthereumAccountId',
        AccountId20: 'EthereumAccountId',
        AccountId32: 'EthereumAccountId',
        Address: 'AccountId',
        LookupSource: 'AccountId',
        Lookup0: 'AccountId',
        AssetId: 'u32',
        Balance: 'u128',
        EventProofId: 'u64',
        ValidatorSetId: 'u64',
        EthereumSignature: {
          r: 'H256',
          s: 'H256',
          v: 'U8'
        },
        ExtrinsicSignature: 'EthereumSignature',
        EthyId: '[u8; 32]',
        EthLog1: {
          address: 'EthAddress',
          topics: 'Vec<H256>',
          data: 'Bytes'
        },
        EthWalletCall: {
          nonce: 'u32'
        },
        XRPLTxData: {
          _enum: {
            Payment: {
              amount: 'Balance',
              destination: 'H160'
            },
            CurrencyPayment: {
              amount: 'Balance',
              address: 'H160',
              currencyId: 'H256'
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        EthEventProofResponse: {
          event_id: 'EventProofId',
          signatures: 'Vec<Bytes>',
          validators: 'Vec<AccountId20>',
          validator_set_id: 'ValidatorSetId',
          block: 'H256',
          tag: 'Option<Bytes>'
        },
        XrplEventProofResponse: {
          event_id: 'EventProofId',
          signatures: 'Vec<Bytes>',
          validators: 'Vec<Bytes>',
          validator_set_id: 'ValidatorSetId',
          block: 'H256',
          tag: 'Option<Bytes>'
        },
        VersionedEventProof: {
          _enum: {
            sentinel: null,
            EventProof: 'EventProof'
          }
        },
        CollectionUuid: 'u32',
        SerialNumber: 'u32',
        TokenId: '(CollectionUuid, SerialNumber)'
      }
    }
  ],
  rpc: {
    dex: {
      quote: {
        description: 'Given some amount of an asset and pair reserves, returns an equivalent amount of the other asset',
        params: [
          {
            name: 'amountA',
            type: 'u128'
          },
          {
            name: 'reserveA',
            type: 'u128'
          },
          {
            name: 'reserveB',
            type: 'u128'
          }
        ],
        type: 'Json'
      },
      getAmountsOut: {
        description: 'Given an array of AssetIds, return amounts out for an amount in',
        params: [
          {
            name: 'amountIn',
            type: 'Balance'
          },
          {
            name: 'path',
            type: 'Vec<AssetId>'
          }
        ],
        type: 'Json'
      },
      getAmountsIn: {
        description: 'Given an array of AssetIds, return amounts in for an amount out',
        params: [
          {
            name: 'amountOut',
            type: 'balance'
          },
          {
            name: 'path',
            type: 'Vec<AssetId>'
          }
        ],
        type: 'Json'
      },
      getLPTokenID: {
        description: 'Given two AssetIds, return liquidity token created for the pair',
        params: [
          {
            name: 'assetA',
            type: 'AssetId'
          },
          {
            name: 'assetB',
            type: 'AssetId'
          }
        ],
        type: 'Json'
      },
      getLiquidity: {
        description: 'Given two AssetIds, return liquidity',
        params: [
          {
            name: 'assetA',
            type: 'AssetId'
          },
          {
            name: 'assetB',
            type: 'AssetId'
          }
        ],
        type: 'Json'
      },
      getTradingPairStatus: {
        description: 'Given two AssetIds, return whether trading pair is enabled or disabled',
        params: [
          {
            name: 'assetA',
            type: 'AssetId'
          },
          {
            name: 'assetB',
            type: 'AssetId'
          }
        ],
        type: 'Text'
      }
    },
    ethy: {
      getEventProof: {
        description: 'Get ETH event proof for event Id',
        params: [
          {
            name: 'eventId',
            type: 'EventProofId'
          }
        ],
        type: 'Option<EthEventProofResponse>'
      },
      getXrplTxProof: {
        description: 'Get XRPL event proof for event Id',
        params: [
          {
            name: 'eventId',
            type: 'EventProofId'
          }
        ],
        type: 'Option<XrplEventProofResponse>'
      }
      // subscribeEventProofs: {
      //   description: 'Returns event proofs generated by Ethy',
      //   params: [],
      //   type: 'Json'
      // },
      // unsubscribeEventProofs: {
      //   description: 'Unsubscribe from event proofs',
      //   params: [],
      //   type: 'Json'
      // }
    },
    nft: {
      ownedTokens: {
        description: 'Get all NFTs owned by an account',
        params: [
          {
            name: 'collectionId',
            type: 'CollectionUuid'
          },
          {
            name: 'who',
            type: 'AccountId'
          },
          { name: 'cursor', type: 'SerialNumber' },
          { name: 'limit', type: 'u16' }
        ],
        type: 'Json'
      },
      tokenUri: {
        description: 'Get the URI of a token',
        params: [
          {
            name: 'tokenId',
            type: 'TokenId'
          }
        ],
        type: 'Json'
      }
    }
  }
};

export default definitions;

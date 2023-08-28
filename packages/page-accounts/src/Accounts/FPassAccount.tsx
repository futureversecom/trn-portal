// Copyright 2017-2023 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import { AddressSmall, Table } from '@polkadot/react-components';
import { useToggle } from '@polkadot/react-hooks';

interface Props {
  className?: string;
  defaultName?: string;
  filter: string;
  isFavorite: boolean;
  value?: string;
}

function FPassAccount ({ className = '', defaultName, value }: Props): React.ReactElement<Props> | null {
  const [isExpanded, toggleIsExpanded] = useToggle(false);

  return (
    <>
      <StyledTr className={`${className} isExpanded isFirst packedBottom`}>
        <td className='address all relative'>
          <AddressSmall
            defaultName={defaultName}
            value={value as string}
          />
        </td>
        <Table.Column.Expand
          isExpanded={isExpanded}
          toggle={toggleIsExpanded}
        />
      </StyledTr>
    </>
  );
}

const StyledTr = styled.tr`
  .devBadge {
    opacity: var(--opacity-light);
  }
`;

export default React.memo(FPassAccount);

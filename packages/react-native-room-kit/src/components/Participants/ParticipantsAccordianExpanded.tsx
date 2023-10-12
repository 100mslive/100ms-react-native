import * as React from 'react';

import type { ParticipantAccordianData } from '../../hooks-util';
import { ParticipantsItem } from './ParticipantsItem';

interface ParticipantsAccordianExpandedProps {
  id: ParticipantAccordianData['id'];
  data: ParticipantAccordianData['data'];
}

export const ParticipantsAccordianExpanded: React.FC<
  ParticipantsAccordianExpandedProps
> = ({ id, data }) => {
  return (
    <>
      {data.map((participant) => {
        return (
          <ParticipantsItem
            key={participant.peerID}
            groupId={id}
            data={participant}
          />
        );
      })}
    </>
  );
};

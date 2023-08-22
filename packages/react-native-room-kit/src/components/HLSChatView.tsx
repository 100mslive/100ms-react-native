import * as React from 'react';

import { HMSKeyboardAvoidingView } from './HMSKeyboardAvoidingView';
import { HMSSendMessageInput } from './HMSSendMessageInput';
import { HMSHLSMessageList } from './HMSHLSMessageList';

export const HLSChatView = () => {
  return (
    <HMSKeyboardAvoidingView>
      <HMSHLSMessageList />
      <HMSSendMessageInput />
    </HMSKeyboardAvoidingView>
  );
};

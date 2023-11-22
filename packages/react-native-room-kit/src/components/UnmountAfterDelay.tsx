import * as React from 'react';

export interface UnmountAfterDelayProps {
  // current visible state of content
  visible: boolean;
  // callback which unmounts the content by setting a state
  onUnmount(): void;
  // content to show
  children: React.ReactElement;
  // delay after which content should hide
  delay?: number;
}

export type UnmountAfterDelayAttrs = {
  resetTimer(): void;
};

export const UnmountAfterDelay = React.forwardRef<
  UnmountAfterDelayAttrs,
  UnmountAfterDelayProps
>(({ delay = 4000, children, visible, onUnmount }, ref) => {
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);

  const setTimer = React.useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      onUnmount();
      timeoutId.current = null;
    }, delay);
  }, [delay]);

  const clearTimer = React.useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      resetTimer: () => {
        clearTimer();
        setTimer();
      },
    }),
    [setTimer]
  );

  React.useEffect(() => {
    if (visible) {
      setTimer();

      return clearTimer;
    }
  }, [visible, setTimer, clearTimer]);

  return visible ? children : null;
});

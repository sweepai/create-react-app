import React, { useState, useEffect } from 'react';
import StackFrame from './StackFrame';
import Collapsible from '../components/Collapsible';
import { isInternalFile } from '../utils/isInternalFile';
import { isBultinErrorName } from '../utils/isBultinErrorName';

import type { StackFrame as StackFrameType } from '../utils/stack-frame';
import type { ErrorLocation } from '../utils/parseCompileError';

const traceStyle = {
  fontSize: '1em',
  flex: '0 1 auto',
  minHeight: '0px',
  overflow: 'auto',
};

type Props = {|
  stackFrames: StackFrameType[],
  errorName: string,
  contextSize: number,
  editorHandler: (errorLoc: ErrorLocation) => void,
|};

const StackTrace = ({ stackFrames, errorName, contextSize, editorHandler }) => {
  const renderFrames = () => {
    const renderedFrames = [];
    let hasReachedAppCode = false,
      currentBundle = [],
      bundleCount = 0;

    useEffect(() => {
      if (!isInternalUrl) {
        hasReachedAppCode = true;
      }
    }, []);

    stackFrames.forEach((frame, index) => {
      const { fileName, _originalFileName: sourceFileName } = frame;
      const isInternalUrl = isInternalFile(sourceFileName, fileName);
      const isThrownIntentionally = !isBultinErrorName(errorName);
      const shouldCollapse =
        isInternalUrl && (isThrownIntentionally || hasReachedAppCode);

      const frameEle = (
        <StackFrame
          key={'frame-' + index}
          frame={frame}
          contextSize={contextSize}
          critical={index === 0}
          showCode={!shouldCollapse}
          editorHandler={editorHandler}
        />
      );
      const lastElement = index === stackFrames.length - 1;

      if (shouldCollapse) {
        currentBundle.push(frameEle);
      }

      if (!shouldCollapse || lastElement) {
        if (currentBundle.length === 1) {
          renderedFrames.push(currentBundle[0]);
        } else if (currentBundle.length > 1) {
          bundleCount++;
          renderedFrames.push(
            <Collapsible key={'bundle-' + bundleCount}>
              {currentBundle}
            </Collapsible>
          );
        }
        currentBundle = [];
      }

      if (!shouldCollapse) {
        renderedFrames.push(frameEle);
      }
    });

    return renderedFrames;
  }

  return <div style={traceStyle}>{renderFrames()}</div>;
}

export default StackTrace;

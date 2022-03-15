import * as log from 'loglevel';
import * as prefix from 'loglevel-plugin-prefix';
import { BoundedLogQueue } from '../utils/bounded-log-queue';

const TXT_LEVEL: log.LogLevelDesc = 'DEBUG';
const LOG_LEVEL: log.LogLevelDesc = 'INFO';

prefix.reg(log);
prefix.apply(log, { format });

function format(level: string, name: any, timestamp: any) {
  return `[${timestamp}] ${level} ${name}:`;
}

export function getLogger(service: string) {
  const ret = log.getLogger(service);
  ret.setLevel(TXT_LEVEL);

  //if (service === 'peer-to-peer.service') ret.setLevel('DEBUG');
  return ret;
}

const allLogs = new BoundedLogQueue(5000);
const originalFactory = log.methodFactory;
const logMethods = [
  "trace",
  "debug",
  "info",
  "warn",
  "error"
];

const myMethodFactory = (methodName: string, logLevel: log.LogLevelNumbers, loggerName: any) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function (...args: any) {
    const currDate = (new Date()).toTimeString().split(' ')[0]
    allLogs.push(`[${currDate}]: ${logMethods[logLevel].toUpperCase()} ${args.map(t => JSON.stringify(t)).join(' ')}`);
    
    if (logLevel >= log.levels[LOG_LEVEL]) {
      rawMethod(...args);
    }
  };
};
log.setLevel(log.getLevel()); // Be sure to call setLevel method in order to apply plugin

function attachMethodFactory() {
  if (log.methodFactory !== myMethodFactory) {
    // @ts-ignore: read-only
    log.methodFactory = myMethodFactory;
  }  
}

export function downloadLogs() {
  downloadText(`${(new Date()).toISOString()}.txt`, allLogs.getOrderedArray().join('\n'));
}

// https://stackoverflow.com/questions/24898044/is-possible-to-save-javascript-variable-as-file
function downloadText(filename: string, textToSave: string) {
  var hiddenElement = document.createElement('a');

  hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
  hiddenElement.target = '_blank';
  hiddenElement.download = filename;
  hiddenElement.click();
}

window['downloadLogs'] = downloadLogs;
attachMethodFactory();

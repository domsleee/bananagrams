import * as log from 'loglevel';
import * as prefix from 'loglevel-plugin-prefix';

prefix.reg(log);
prefix.apply(log, {
  format(level: string, name: any, timestamp: any) {
    return `[${timestamp}] ${level} ${name}:`;
  }
});

export function getLogger(service: string) {
  const ret = log.getLogger(service);
  ret.setLevel('INFO');
  //if (service === 'peer-to-peer.service') ret.setLevel('DEBUG');
  return ret;
}
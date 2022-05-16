import { NetworkType } from '../types/NetworkType';
import b58Prefix from './b58Prefix';

const networkPrefix: b58Prefix = {
  MainNet: 0x32,
  TestNet: 0x6e,
  RegTest: 0x70
};

const defNetork: NetworkType = 'TestNet';

export { networkPrefix, defNetork };

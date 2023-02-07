import bs58 from 'bs58';
import { ethers, toUtf8Bytes } from 'ethers';
import { networkPrefix } from '../interfaces/NetworkInterface';

const toHexAddress = (address: string) => {
  const bytes = bs58.decode(address);
  const hex = Buffer.from(bytes.buffer).toString('hex');
  return hex.substring(2, hex.length - 8);
};

const fromHexAddress = (
  network: 'MainNet' | 'TestNet' | 'RegTest',
  hex: string
) => {
  if (hex.length !== 40) {
    return undefined;
  }
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  const hash = toUtf8Bytes(
    ethers.sha256(
      ethers.sha256(
        `0x${Buffer.from([networkPrefix[network], ...bytes]).toString('hex')}`
      )
    )
  );
  const checksum = [hash[0], hash[1], hash[2], hash[3]];
  return bs58.encode([networkPrefix[network], ...bytes, ...checksum]);
};

export { toHexAddress, fromHexAddress };

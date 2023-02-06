import { ethers } from 'ethers';

const labelhash = (label: string) => {
  return ethers.keccak256(ethers.toUtf8Bytes(label));
};
export default labelhash;

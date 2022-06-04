import { ethers } from 'ethers';

const labelhash = (label: string) => {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label));
};
export default labelhash;

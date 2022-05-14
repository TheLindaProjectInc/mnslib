import {keccak256} from 'ethers/lib/utils';
import {ethers} from 'ethers';
import uts46 from 'idna-uts46-hx';

export function namehash(inputName: string) {
  // Reject empty names:
  let node = '';
  for (var i = 0; i < 32; i++) {
    node += '00';
  }

  let name = normalize(inputName);

  if (name) {
    let labels = name.split('.');

    for (var i = labels.length - 1; i >= 0; i--) {
      var labelSha = keccak256(ethers.utils.toUtf8Bytes(labels[i]));
      node = keccak256(Buffer.from(node + labelSha, 'hex'));
    }
  }

  return '0x' + node;
}

export function normalize(name: string) {
  return name
    ? uts46.toAscii(name, {
        useStd3ASCII: true,
        transitional: false,
        verifyDnsLength: false,
      })
    : name;
}

export function encodeLabelhash(hash: string) {
  if (!hash.startsWith('0x')) {
    throw new Error('Expected label hash to start with 0x');
  }

  if (hash.length !== 66) {
    throw new Error('Expected label hash to have a length of 66');
  }

  return `[${hash.slice(2)}]`;
}

export function decodeLabelhash(hash: string) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error(
      'Expected encoded labelhash to start and end with square brackets'
    );
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66');
  }

  return `${hash.slice(1, -1)}`;
}

export function isEncodedLabelhash(hash: string) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66;
}

export function isDecrypted(name: string) {
  const nameArray = name.split('.');
  const decrypted = nameArray.reduce((acc, label) => {
    if (acc === false) return false;
    return isEncodedLabelhash(label) ? false : true;
  }, true);

  return decrypted;
}

export function labelhash(unnormalisedLabelOrLabelhash: string) {
  return isEncodedLabelhash(unnormalisedLabelOrLabelhash)
    ? '0x' + decodeLabelhash(unnormalisedLabelOrLabelhash)
    : '0x' +
        keccak256(
          ethers.utils.toUtf8Bytes(normalize(unnormalisedLabelOrLabelhash))
        );
}

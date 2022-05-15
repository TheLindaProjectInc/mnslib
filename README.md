[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/@metrixnames%2Fmnslib.svg)](https://badge.fury.io/js/@metrixnames%2Fmnslib) ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/TheLindaProjectInc/mnslib/main) [![Node.js CI](https://github.com/TheLindaProjectInc/mnslib/actions/workflows/node.js.yml/badge.svg)](https://github.com/TheLindaProjectInc/mnslib/actions/workflows/node.js.yml)

# mnslib

mnslib is an update/port of [**ensjs**](https://github.com/ensdomains/ensjs) made to work for the Metrix Name Service and MetrixCoin blockchain.

### Installation

```
npm install --save @metrixnames/mnslib
```

### Example Usage

```
import MNS, { getMNSAddress } from '@metrixnames/mnslib';

const network = 'TestNet'; // can be 'MainNet' or 'TestNet'

//  const mrpc = new MetrixRPCNode(
//    null,
//    'http://localhost:33841',
//    'rpcuser',
//    'rpcpass'
//  );
//  const sender = 'maTQfd4w7mqCzGL32RgBFMYY9ehCmjLEGf'; // sending address which the wallet controls the keys for
//  const provider = new RPCProvider(network, mrpc, sender); // create a read/write provider using a local wallet daemon (usually used server side)

//  const provider = new Web3Provider(network); // create a read/write provider using web3 (MetriMask) (always used client side)

const provider = new APIProvider(network); // create a readonly provider using the explorer API (usually used client side)

const mns = new MNS(network, provider, getMNSAddress(network));

const name: Name = mns.name('burn.mrx');             // return a Name object which can be used to make record queries

const address = await name.getAddress('MRX');      // return a standard MetrixCoin address slip44:326
                                                     // ex: M7uAERuQW2AotfyLDyewFGcLUDtAYu9v5V

const resAddress = await name.getResolverAddr();     // an EVM address of the resolver for the name

const resolver: Resolver = mns.resolver(resAddress); // a Resolver object which can be used to query names from this specific resolver

const owner = resolver.name('burn.mrx').getOwner();  // an EVM address of an EOA (Hexified MRX) or contract
                                                     // ex: 0x0000000000000000000000000000000000000000
```

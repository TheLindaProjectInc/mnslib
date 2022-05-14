# mnslib

### Example Usage

```
import MNS, { getMNSAddress } from '@metrixnames/mnslib';


const network = 'MainNet'; // can be 'MainNet' or 'TestNet'

const provider = new APIProvider(network);           // create a readonly provider using the explorer API

const mns = new MNS(network, provider, getMNSAddress(network));

const name: Name = mns.name('burn.mrx');             // return a Name object which can be used to make record queries

const address = await name.getAddress('0x146');      // return a standard MetrixCoin address slip44:326
                                                     // ex: M7uAERuQW2AotfyLDyewFGcLUDtAYu9v5V

const resAddress = await name.getResolverAddr();     // an EVM address of the resolver for the name

const resolver: Resolver = mns.resolver(resAddress); // a Resolver object which can be used to query names from this specific resolver

const owner = resolver.name('burn.mrx').getOwner();  // an EVM address of an EOA (Hexified MRX) or contract
                                                     // ex: 0x0000000000000000000000000000000000000000
```

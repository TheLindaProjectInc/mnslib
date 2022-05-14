"use strict";
exports.__esModule = true;
exports.MRXRegistrarController = void 0;
exports.MRXRegistrarController = [
    {
        inputs: [
            {
                internalType: 'contract BaseRegistrarImplementation',
                name: '_base',
                type: 'address'
            },
            {
                internalType: 'contract PriceOracle',
                name: '_prices',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_minCommitmentAge',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_maxCommitmentAge',
                type: 'uint256'
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'label',
                type: 'bytes32'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'cost',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'expires',
                type: 'uint256'
            },
        ],
        name: 'NameRegistered',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'label',
                type: 'bytes32'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'cost',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'expires',
                type: 'uint256'
            },
        ],
        name: 'NameRenewed',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'oracle',
                type: 'address'
            },
        ],
        name: 'NewPriceOracle',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event'
    },
    {
        inputs: [],
        name: 'MIN_REGISTRATION_DURATION',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
        ],
        name: 'available',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'commitment',
                type: 'bytes32'
            },
        ],
        name: 'commit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            },
        ],
        name: 'commitments',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'bytes32',
                name: 'secret',
                type: 'bytes32'
            },
        ],
        name: 'makeCommitment',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            },
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'bytes32',
                name: 'secret',
                type: 'bytes32'
            },
            {
                internalType: 'address',
                name: 'resolver',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'addr',
                type: 'address'
            },
        ],
        name: 'makeCommitmentWithConfig',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32'
            },
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [],
        name: 'maxCommitmentAge',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'minCommitmentAge',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'duration',
                type: 'uint256'
            },
            {
                internalType: 'bytes32',
                name: 'secret',
                type: 'bytes32'
            },
        ],
        name: 'register',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'duration',
                type: 'uint256'
            },
            {
                internalType: 'bytes32',
                name: 'secret',
                type: 'bytes32'
            },
            {
                internalType: 'address',
                name: 'resolver',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'addr',
                type: 'address'
            },
        ],
        name: 'registerWithConfig',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                internalType: 'uint256',
                name: 'duration',
                type: 'uint256'
            },
        ],
        name: 'renew',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
            {
                internalType: 'uint256',
                name: 'duration',
                type: 'uint256'
            },
        ],
        name: 'rentPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_minCommitmentAge',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_maxCommitmentAge',
                type: 'uint256'
            },
        ],
        name: 'setCommitmentAges',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'contract PriceOracle',
                name: '_prices',
                type: 'address'
            },
        ],
        name: 'setPriceOracle',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: 'interfaceID',
                type: 'bytes4'
            },
        ],
        name: 'supportsInterface',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            },
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string'
            },
        ],
        name: 'valid',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            },
        ],
        stateMutability: 'pure',
        type: 'function'
    },
    {
        inputs: [],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
];

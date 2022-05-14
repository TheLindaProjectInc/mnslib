"use strict";
exports.__esModule = true;
exports.MNSMigrations = void 0;
exports.MNSMigrations = [
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
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
        ],
        name: 'migrations',
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
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'completed',
                type: 'uint256'
            },
        ],
        name: 'setCompleted',
        outputs: [],
        stateMutability: 'nonpayable',
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
];

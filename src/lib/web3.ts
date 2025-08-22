import { parseUnits, formatUnits } from 'viem';

// Contract and network configuration
export const USDC_TOKEN_ADDRESS = '0x93aA0ccD1e5628d3A841C4DbdF602D9eb04085d6';
export const TREASURY_ADDRESS = '0xD1B77E5BE43d705549E38a23b59CF5365f17E227';
export const RPC_URL = 'https://ethereum-rpc.publicnode.com';
export const CHAIN_ID = 1;

// ERC20 ABI for token transfers
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, 6); // USDC has 6 decimals
}

export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

// Minimum amounts
export const MIN_CARD_CREATION_AMOUNT = 20;
export const MIN_TOPUP_AMOUNT = 15;
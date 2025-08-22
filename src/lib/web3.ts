import { parseUnits, formatUnits } from 'viem';

// Contract and network configuration
export const USDC_TOKEN_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Mainnet USDC
export const TREASURY_ADDRESS = '0xD1B77E5BE43d705549E38a23b59CF5365f17E227'; // Your treasury address
export const RPC_URL = 'https://eth.llamarpc.com'; // Reliable RPC provider
export const CHAIN_ID = 1; // Ethereum Mainnet

// ERC20 ABI for token transfers
export const ERC20_ABI = [
  // Standard ERC20 methods
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
] as const;

// Main contract ABI for card creation
export const CARD_VAULT_ABI = [
  'function createCard(address recipient, uint256 amount) external',
  'function getCardDetails(address user) external view returns (string memory, string memory, string memory, string memory)'
] as const;

export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, 6); // USDC has 6 decimals
}

export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

// Minimum amounts (in USDC)
export const MIN_CARD_CREATION_AMOUNT = 20; // $20 USDC
export const MIN_TOPUP_AMOUNT = 15; // $15 USDC

// Contract addresses
export const CARD_VAULT_ADDRESS = '0x...'; // Your card vault contract address

// Transaction settings
export const DEFAULT_GAS_LIMIT = 300000; // Default gas limit for transactions
export const GAS_PRICE_MULTIPLIER = 1.2; // 20% higher than estimated

// Transaction status
export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

// Error messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient USDC balance',
  TRANSACTION_REJECTED: 'Transaction rejected',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error',
  INVALID_ADDRESS: 'Invalid address',
  INVALID_AMOUNT: 'Invalid amount'
} as const;

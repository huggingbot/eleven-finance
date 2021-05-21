import BigNumber from 'bignumber.js';

export const NINI_PER_BLOCK = new BigNumber(100)
export const BLOCK_TIME = 3
export const BLOCKS_PER_YEAR = new BigNumber((60 / BLOCK_TIME) * 60 * 24 * 365) // 10512000
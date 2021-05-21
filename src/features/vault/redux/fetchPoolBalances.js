import { useCallback } from 'react';
import { earnContractABI, erc20ABI } from "../../configure";
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';

import { getNetworkMulticall } from 'features/helpers/getNetworkData';
import { byDecimals } from 'features/helpers/bignumber';

import {
  VAULT_FETCH_POOL_BALANCES_BEGIN,
  VAULT_FETCH_POOL_BALANCES_SUCCESS,
  VAULT_FETCH_POOL_BALANCES_FAILURE,
} from './constants';
import { pancakeRouterAbi } from '../../web3/fetchPancakeOutputAmount'
import { Address, NINI_PER_BLOCK, BLOCKS_PER_YEAR } from '../../configure'

const DEFAULT_TOKEN_DECIMAL = new BigNumber(10).pow(18)

const getTotalLiquidity = (lpTotalInQuoteToken, quoteTokenPriceUsd) => {
  const totalLiquidity = new BigNumber(lpTotalInQuoteToken).times(quoteTokenPriceUsd)
  return totalLiquidity.isNaN() || !totalLiquidity.isFinite() ? 0 : totalLiquidity.toNumber()
}

const getPoolApr = (poolWeight, niniPriceUsd, poolLiquidityUsd) => {
  const yearlyNiniRewardAllocation = NINI_PER_BLOCK.times(BLOCKS_PER_YEAR).times(poolWeight)
  const apr = yearlyNiniRewardAllocation.times(niniPriceUsd).div(poolLiquidityUsd).times(100)
  return apr.isNaN() || !apr.isFinite() ? 0 : apr.toNumber()
}

export function fetchPoolBalances(data) {
  return dispatch => {
    // optionally you can have getState as the second argument
    dispatch({
      type: VAULT_FETCH_POOL_BALANCES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const { address, web3, pools } = data;
      // earnContractAddress === Masterchef
      const earnPools = pools.filter(pool => pool.farm.earnContractAddress);

      const tokenCalls = earnPools.map(pool => {
        const contract = new web3.eth.Contract(erc20ABI, pool.quoteTokenAddress);
        return {
          quoteTokenBalanceLP: contract.methods.balanceOf(pool.lpTokenAddress)
        }
      })
      
      const lpTokenCalls = earnPools.map(pool => {
        const contract = new web3.eth.Contract(erc20ABI, pool.lpTokenAddress);
        return {
          allowance: contract.methods.allowance(address, pool.farm.earnContractAddress),
          lpTokenBalanceMC: contract.methods.balanceOf(pool.farm.earnContractAddress),
          lpTotalSupply: contract.methods.totalSupply(),
        }
      });

      // Calling to the Masterchef contract
      const masterchefContract = new web3.eth.Contract(earnContractABI, Address.MASTERCHEF);
      const totalAllocPointCall = [{ totalAllocPoint: masterchefContract.methods.totalAllocPoint() }]

      const vaultCalls = earnPools.map(pool => {
        const contract = new web3.eth.Contract(earnContractABI, pool.farm.earnContractAddress);
        // poolInfo => [lpToken, allocPoint, lastRewardBlock, accNiniPerShare, depositFeeBP, harvestInterval]
        const poolInfo = contract.methods.poolInfo(pool.id);
        return { poolInfo }
      });

      const amountIn = new BigNumber(10).exponentiatedBy(18).toString();
      const routerContract = new web3.eth.Contract(pancakeRouterAbi, Address.PANCAKE_ROUTER)
      const niniPriceCall = [{
          niniTokenPriceUsd: routerContract.methods.getAmountsOut(amountIn, [
            Address.NINI_TOKEN,
            Address.WAVAX_TOKEN,
          ]),
        }];

      const priceCalls = earnPools.map(pool => {
        const contract = new web3.eth.Contract(pancakeRouterAbi, Address.PANCAKE_ROUTER);
        const path = [pool.quoteTokenAddress, pool.tokenAddress]
        const quoteTokenPriceUsd = contract.methods.getAmountsOut(amountIn, path)

        return { quoteTokenPriceUsd }
      })

      const multicall = new MultiCall(web3, getNetworkMulticall());
      multicall.all([tokenCalls, lpTokenCalls, totalAllocPointCall, vaultCalls, niniPriceCall, priceCalls])
        .then(data => {
          const poolsData = {};

          pools.map(pool => {
            let allowance = 0;
            let pricePerFullShare = 1;
            let multiplier = 0;
            let totalLiquidity = 0;
            let apr = 0;

            const callIndex = earnPools.findIndex(earnPool => earnPool.id == pool.id);
            if (callIndex >= 0) {
              /* tokenCalls */
              // Balance of quote token on LP contract
              const quoteTokenBalanceLP = new BigNumber(data[0][callIndex].quoteTokenBalanceLP);

              /* lpTokenCalls */
              // Balance of LP tokens in the master chef contract
              const lpTokenBalanceMC = new BigNumber(data[1][callIndex].lpTokenBalanceMC);
              // Total supply of LP tokens
              const lpTotalSupply = new BigNumber(data[1][callIndex].lpTotalSupply);
              // Ratio in % a LP tokens that are in staking, vs the total number in circulation
              const lpTokenRatio = lpTokenBalanceMC.div(lpTotalSupply).toNumber()
              // Total value in staking in quote token value
              const lpTotalInQuoteToken = new BigNumber(quoteTokenBalanceLP)
              .div(DEFAULT_TOKEN_DECIMAL)
              .times(new BigNumber(2))
              .times(lpTokenRatio)
              allowance = new BigNumber(data[1][callIndex].allowance).toNumber();

              /* totalAllocPointCall */
              const totalAllocPoint = new BigNumber(data[2][0].totalAllocPoint).toNumber();

              /* vaultCalls */
              pricePerFullShare = byDecimals(data[3][callIndex].poolInfo[3], 18).toNumber() || 1;
              const allocPoint = new BigNumber(data[3][callIndex].poolInfo[1])
              multiplier = allocPoint.div(100).toNumber();
              const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint))

              /* niniPriceCall */
              const rawNiniTokenPriceUsd = data[4][0].niniTokenPriceUsd
              const niniTokenPriceUsd = new BigNumber(rawNiniTokenPriceUsd[rawNiniTokenPriceUsd.length - 1])

              /* priceCalls */
              const rawQuoteTokenPriceUsd = data[5][callIndex].quoteTokenPriceUsd
              const quoteTokenPriceUsd = new BigNumber(rawQuoteTokenPriceUsd[rawQuoteTokenPriceUsd.length - 1])
              totalLiquidity = getTotalLiquidity(lpTotalInQuoteToken, quoteTokenPriceUsd)
              apr = getPoolApr(poolWeight, niniTokenPriceUsd, totalLiquidity)
            }
            poolsData[pool.id] = { allowance, pricePerFullShare, multiplier, totalLiquidity, apr }
          })

          dispatch({
            type: VAULT_FETCH_POOL_BALANCES_SUCCESS,
            data: poolsData,
          });

          resolve()
        })
        .catch(error => {
          dispatch({
            type: VAULT_FETCH_POOL_BALANCES_FAILURE,
          });

          return reject(error.message || error);
        });
    });

    return promise;
  }
}


export function useFetchPoolBalances() {
  // args: false value or array
  // if array, means args passed to the action creator
  const dispatch = useDispatch();

  const { pools, fetchPoolBalancesDone, fetchPoolBalancesPending } = useSelector(
    state => ({
      pools: state.vault.pools,
      fetchPoolBalancesDone: state.vault.fetchPoolBalancesDone,
      fetchPoolBalancesPending: state.vault.fetchPoolBalancesPending,
    }),
    shallowEqual,
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchPoolBalances(data));
    },
    [dispatch],
  );

  return {
    pools,
    fetchPoolBalances: boundAction,
    fetchPoolBalancesDone,
    fetchPoolBalancesPending
  };
}

export function reducer(state, action) {
  const { pools } = state;

  switch (action.type) {
    case VAULT_FETCH_POOL_BALANCES_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        fetchPoolBalancesPending: true,
      };

    case VAULT_FETCH_POOL_BALANCES_SUCCESS:
      const updatedPools = pools.map(pool => {
        if (! action.data[pool.id]) {
          return pool;
        }

        const { allowance, pricePerFullShare, multiplier, totalLiquidity, apr } = action.data[pool.id];
        return {
          ...pool,
          allowance,
          pricePerFullShare,
          multiplier,
          totalLiquidity,
          apr
        }
      });

      return {
        ...state,
        pools: updatedPools,
        fetchPoolBalancesDone: true,
        fetchPoolBalancesPending: false,
      };

    case VAULT_FETCH_POOL_BALANCES_FAILURE:
      // The request is failed
      return {
        ...state,
        fetchPoolBalancesPending: false,
      };

    default:
      return state;
  }
}

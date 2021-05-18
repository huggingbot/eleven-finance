import { useCallback } from 'react';
import { earnContractABI, erc20ABI } from "../../configure";
import bigfootBnbBankABI from '../../configure/abis/bigfootBnbBank';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';

import { getNetworkMulticall, getNetworkTokenShim } from 'features/helpers/getNetworkData';
import { byDecimals } from 'features/helpers/bignumber';

import {
  VAULT_FETCH_POOL_BALANCES_BEGIN,
  VAULT_FETCH_POOL_BALANCES_SUCCESS,
  VAULT_FETCH_POOL_BALANCES_FAILURE,
} from './constants';

export function fetchPoolBalances(data) {
  return dispatch => {
    // optionally you can have getState as the second argument
    dispatch({
      type: VAULT_FETCH_POOL_BALANCES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const { address, web3, pools } = data;
      const earnPools = pools.filter(pool => pool.earnContractAddress);

      const tokenCalls = earnPools.map(pool => {
        const contract = new web3.eth.Contract(erc20ABI, pool.tokenAddress || getNetworkTokenShim());

        return {
          allowance: contract.methods.allowance(address, pool.earnContractAddress)
        }
      });

      const vaultCalls = earnPools.map(pool => {
        let pricePerShareCall;

        // Calculate price per share from total supply for Bigfiit BNB bank
        if (pool.earnContractAddress == '0xA96C90223e4cC69192A9ffF1BA4c8b86D02765B2') {
          const contract = new web3.eth.Contract(bigfootBnbBankABI, pool.earnContractAddress);

          return {
            totalBNB: contract.methods.totalBNB(),
            totalSupply: contract.methods.totalSupply()
          }
        }

        // Using a separate method for E11 token
        if (pool.earnContractAddress == '0x3Ed531BfB3FAD41111f6dab567b33C4db897f991') {
          const contract = new web3.eth.Contract([{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"shareToTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sharesPerToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"tokenToShares","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokensPerShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalElevenFunds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"}], pool.earnContractAddress);
          pricePerShareCall = contract.methods.tokensPerShare();
        } else {
          const contract = new web3.eth.Contract(earnContractABI, pool.earnContractAddress);
          pricePerShareCall = contract.methods.getPricePerFullShare();
        }

        return {
          pricePerShare: pricePerShareCall
        }
      });

      const multicall = new MultiCall(web3, getNetworkMulticall());
      multicall.all([tokenCalls, vaultCalls])
        .then(data => {
          const poolsData = {};

          pools.map(pool => {
            let allowance = 0;
            let pricePerFullShare = 1;

            const callIndex = earnPools.findIndex(earnPool => earnPool.id == pool.id);
            if (callIndex >= 0) {
              allowance = new BigNumber(data[0][callIndex].allowance).toNumber();

              if (pool.earnContractAddress == '0xA96C90223e4cC69192A9ffF1BA4c8b86D02765B2') {
                // Calculate price per share from total supply for Bigfoot BNB Bank
                pricePerFullShare = (new BigNumber(data[1][callIndex].totalBNB)).div(new BigNumber(data[1][callIndex].totalSupply));
              } else {
                const multiplier = pool.earnContractAddress == '0x3Ed531BfB3FAD41111f6dab567b33C4db897f991' ? 1e6 : 1;
                pricePerFullShare = byDecimals(data[1][callIndex].pricePerShare * multiplier, 18).toNumber() || 1;
              }
            }

            poolsData[pool.id] = { allowance, pricePerFullShare }
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

        const { allowance, pricePerFullShare } = action.data[pool.id];
        return {
          ...pool,
          allowance,
          pricePerFullShare
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

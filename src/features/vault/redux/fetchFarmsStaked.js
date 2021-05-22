import { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { MultiCall } from 'eth-multicall';

import { byDecimals } from 'features/helpers/bignumber';
import { getNetworkMulticall } from 'features/helpers/getNetworkData';
import { pool4Abi } from 'features/configure/abi';

import {
  VAULT_FETCH_FARMS_STAKED_BEGIN,
  VAULT_FETCH_FARMS_STAKED_SUCCESS,
  VAULT_FETCH_FARMS_STAKED_FAILURE
} from './constants';
import BigNumber from 'bignumber.js';

export function fetchFarmsStaked({ address, web3, pools }) {
  return dispatch => {
    dispatch({
      type: VAULT_FETCH_FARMS_STAKED_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const farmPools = pools.filter(pool => pool.farm);

      const multicall = new MultiCall(web3, getNetworkMulticall());

      const calls = farmPools.map(pool => {
        const { earnContractAddress, masterchefPid } = pool.farm;

        const contract = new web3.eth.Contract(pool4Abi, earnContractAddress);

        // userInfo => [amount, rewardDebt, rewardLockedUp, nextHarvestUntil]
        const userInfo = contract.methods.userInfo(masterchefPid, address)
        return { userInfo };
      });

      multicall
        .all([calls])
        .then(([results]) => {
          const stakedAmounts = {};
          const nextHarvestUntil = {}

          pools.map(pool => {
            const callIndex = farmPools.findIndex(farmPool => farmPool.id == pool.id);

            stakedAmounts[pool.id] = callIndex >= 0
              ? byDecimals(results[callIndex].userInfo[0], pool.farm.earnedTokenDecimals)
              : new BigNumber(0);

            nextHarvestUntil[pool.id] = callIndex >= 0
              ? results[callIndex].userInfo[3]
              : new BigNumber(0)
          })

          dispatch({
            type: VAULT_FETCH_FARMS_STAKED_SUCCESS,
            data: { stakedAmounts, nextHarvestUntil },
          })

          resolve();
        })
        .catch(error => {
          dispatch({
            type: VAULT_FETCH_FARMS_STAKED_FAILURE,
          });

          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function useFetchFarmsStaked() {
  const dispatch = useDispatch();

  const { pools, fetchFarmsStakedDone, fetchFarmsStakedPending } = useSelector(
    state => ({
      pools: state.vault.pools,
      fetchFarmsStakedDone: state.vault.fetchFarmsStakedDone,
      fetchFarmsStakedPending: state.vault.fetchFarmsStakedPending,
    }),
    shallowEqual
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchFarmsStaked(data));
    },
    [dispatch],
  );

  return {
    pools,
    fetchFarmsStaked: boundAction,
    fetchFarmsStakedDone,
    fetchFarmsStakedPending,
  };
}

export function reducer(state, action) {
  const { pools } = state;

  switch (action.type) {
    case VAULT_FETCH_FARMS_STAKED_BEGIN:
      return {
        ...state,
        fetchFarmsStakedPending: true,
      };

    case VAULT_FETCH_FARMS_STAKED_SUCCESS:
      const updatedPools = pools.map(pool => {
        const stakedAmount = action.data.stakedAmounts[pool.id];
        const nextHarvestUntil = action.data.nextHarvestUntil[pool.id];

        return {
          ...pool,
          stakedAmount,
          nextHarvestUntil,
        }
      });

      return {
        ...state,
        pools: updatedPools,
        fetchFarmsStakedDone: true,
        fetchFarmsStakedPending: false,
      };

    case VAULT_FETCH_FARMS_STAKED_FAILURE:
      return {
        ...state,
        fetchFarmsStakedPending: false,
      };

    default:
      return state;
  }
}

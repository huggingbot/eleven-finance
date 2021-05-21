import { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { MultiCall } from 'eth-multicall';

import { getNetworkMulticall } from 'features/helpers/getNetworkData';
import { erc20ABI } from 'features/configure'

import {
  VAULT_FETCH_BALANCES_BEGIN,
  VAULT_FETCH_BALANCES_SUCCESS,
  VAULT_FETCH_BALANCES_FAILURE,
} from './constants';

export function fetchBalances(data) {
  return dispatch => {
    dispatch({
      type: VAULT_FETCH_BALANCES_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const { address, web3, tokens } = data;

      const tokensList = [];
      for (let key in tokens) {
        tokensList.push({
          token: key,
          lpTokenAddress: tokens[key].lpTokenAddress,
          tokenBalance: tokens[key].tokenBalance,
        });
      }

      const multicall = new MultiCall(web3, getNetworkMulticall());

      const calls = tokensList.map(token => {
        const tokenContract = new web3.eth.Contract(erc20ABI, token.lpTokenAddress);
        return {
          tokenBalance: tokenContract.methods.balanceOf(address),
        };
      });

      multicall
        .all([calls])
        .then(([results]) => {
          const newTokens = {};
          for (let i = 0; i < tokensList.length; i++) {
            newTokens[tokensList[i].token] = {
              lpTokenAddress: tokensList[i].lpTokenAddress,
              tokenBalance: results[i].tokenBalance || 0,
            };
          }

          dispatch({
            type: VAULT_FETCH_BALANCES_SUCCESS,
            data: newTokens,
          });

          resolve();
        })
        .catch(error => {
          dispatch({
            type: VAULT_FETCH_BALANCES_FAILURE,
          });

          return reject(error.message || error);
        });
    });

    return promise;
  };
}

export function useFetchBalances() {
  const dispatch = useDispatch();

  const { tokens, fetchBalancesDone, fetchBalancesPending } = useSelector(
    state => ({
      tokens: state.vault.tokens,
      fetchBalancesDone: state.vault.fetchBalancesDone,
      fetchBalancesPending: state.vault.fetchBalancesPending,
    }),
    shallowEqual,
  );

  const boundAction = useCallback(
    (data) => {
      return dispatch(fetchBalances(data));
    },
    [dispatch],
  );

  return {
    tokens,
    fetchBalances: boundAction,
    fetchBalancesDone,
    fetchBalancesPending,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case VAULT_FETCH_BALANCES_BEGIN:
      return {
        ...state,
        fetchBalancesPending: true,
      };

    case VAULT_FETCH_BALANCES_SUCCESS:
      return {
        ...state,
        tokens: action.data,
        fetchBalancesDone: true,
        fetchBalancesPending: false,
      };

    case VAULT_FETCH_BALANCES_FAILURE:
      return {
        ...state,
        fetchBalancesPending: false,
      };

    default:
      return state;
  }
}
import BigNumber from 'bignumber.js';
import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { fetchPancakeOutputAmount } from '../../web3';

import { HOME_FETCH_TOKEN_PRICE_SUCCESS } from './constants';
import { Address } from '../../configure'


export function fetchTokenPrice({ web3 }) {
  return dispatch => {
    const path = [Address.NINI_TOKEN, Address.WAVAX_TOKEN, /* Address.USDT_TOKEN */]

    const amountIn = new BigNumber(10).exponentiatedBy(18).toString();

    fetchPancakeOutputAmount({ web3, amountIn, path})
      .then(tokenPrice => {
        dispatch({
          type: HOME_FETCH_TOKEN_PRICE_SUCCESS,
          data: tokenPrice.dividedBy(new BigNumber(10).exponentiatedBy(18))
        })
      });
  }
}

export function useFetchTokenPrice() {
  const dispatch = useDispatch();

  const { tokenPriceUsd, fetchTokenPriceDone } = useSelector(
    state => ({
      tokenPriceUsd: state.home.tokenPriceUsd,
      fetchTokenPriceDone: state.home.fetchTokenPriceDone
    }),
    shallowEqual
  )

  const fetchPriceAction = useCallback(data => dispatch(fetchTokenPrice(data)), [dispatch]);

  return {
    tokenPriceUsd,
    fetchTokenPrice: fetchPriceAction,
    fetchTokenPriceDone,
  }
};

export function reducer(state, action) {
  switch (action.type) {
    case HOME_FETCH_TOKEN_PRICE_SUCCESS:
      return {
        ...state,

        tokenPriceUsd: action.data,
        fetchTokenPriceDone: true,
      }

    default:
      return state;
  }
}
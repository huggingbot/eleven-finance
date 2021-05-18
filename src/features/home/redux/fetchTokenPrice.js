import BigNumber from 'bignumber.js';
import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { fetchPancakeOutputAmount } from '../../web3';

import { HOME_FETCH_TOKEN_PRICE_SUCCESS } from './constants';

export function fetchTokenPrice({ web3 }) {
  return dispatch => {
    const path = [
      '0x28C4d63fa665ECf203fF8525D9a52DeEE8c61c6e', // NINI
      '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3', // WAVAX
      '0x078126a917DBD76EdB31B5B7F8E1e735946Ece3d', // USDT
    ]

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
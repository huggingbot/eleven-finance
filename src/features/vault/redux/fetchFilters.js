import { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import _ from 'lodash';

import {
  VAULT_FILTERS_SET_CATEGORIES,
  VAULT_FILTERS_SET_DEPOSITED,
  VAULT_FILTERS_SET_WITH_BALANCE,
  VAULT_FILTERS_SET_SEARCH_PHRASE,
  VAULT_FILTERS_SET_SORT,
} from './constants';

const setCategoriesFilter = (categories) => {
  return dispatch => {
    dispatch({
      type: VAULT_FILTERS_SET_CATEGORIES,
      data: categories
    });
  }
}

const setDepositedFilter = (value) => {
  return dispatch => {
    dispatch({
      type: VAULT_FILTERS_SET_DEPOSITED,
      data: value
    });
  }
}

const setWithBalanceFilter = (value) => {
  return dispatch => {
    dispatch({
      type: VAULT_FILTERS_SET_WITH_BALANCE,
      data: value
    });
  }
}

const setSearchPhrase = (value) => {
  return dispatch => {
    dispatch({
      type: VAULT_FILTERS_SET_SEARCH_PHRASE,
      data: value
    });
  }
}

const setSort = (value) => {
  return dispatch => {
    dispatch({
      type: VAULT_FILTERS_SET_SORT,
      data: value
    });
  }
}

const getFilteredPools = (pools, tokens, filters, categories) => {
  if (! pools) {
    return;
  }

  let filteredPools = [...pools];

  // Filter by name
  if (filters.searchPhrase) {
    const phrase = filters.searchPhrase.toLowerCase();
    filteredPools = filteredPools.filter(pool => pool.token.toLowerCase().includes(phrase));
  }

  // Filter by deposited
  if (filters.deposited) {
    filteredPools = filteredPools.filter(pool => {
      return tokens[pool.earnedToken]?.tokenBalance > 0
        || pool.stakedAmount?.gt(0);
    });
  }

  // Filter by tokens with non-zero balance
  if (filters.withBalance) {
    filteredPools = filteredPools.filter(pool => {
      return tokens[pool.token]?.tokenBalance > 0
        || tokens[pool.earnedToken]?.tokenBalance > 0
        || pool.stakedAmount?.gt(0);
    });
  }

  // Filter by categories
  if (filters.categories.length) {
    filteredPools = filteredPools.filter(pool => {
      return _.intersection(pool.categories || [], filters.categories).length > 0;
    });
  } else {
    // Show all pools without category or in categories active by default
    const defaultCategories = categories.filter(category => category.default).map(category => category.name);

    filteredPools = filteredPools.filter(pool => {
      return ! pool.categories?.length || _.intersection(pool.categories, defaultCategories).length > 0;
    });
  }

  // Sort pools
  switch (filters.sort) {
    case 'apy':
      filteredPools = _.orderBy(filteredPools, pool => pool.apy || 0, 'desc');
      break;
    case 'apd':
      filteredPools = _.orderBy(filteredPools, pool => pool.aprd || 0, 'desc');
      break;
    case 'tvl':
      filteredPools = _.orderBy(filteredPools, pool => pool.tvl || 0, 'desc');
      break;
  }

  return filteredPools;
}

export function useFetchFilters(pools, tokens) {
  const dispatch = useDispatch();

  const { filters, categories } = useSelector(
    state => ({
      filters: state.vault.filters,
      categories: state.vault.categories
    }),
    shallowEqual
  );

  const setCategoriesAction = useCallback(data => dispatch(setCategoriesFilter(data)), [dispatch]);
  const setDepositedAction = useCallback(data => dispatch(setDepositedFilter(data)), [dispatch]);
  const setWithBalanceAction = useCallback(data => dispatch(setWithBalanceFilter(data)), [dispatch]);
  const setSearchPhraseAction = useCallback(data => dispatch(setSearchPhrase(data)), [dispatch]);
  const setSortAction = useCallback(data => dispatch(setSort(data)), [dispatch]);

  // Store current filters state in local storage
  try {
    localStorage.setItem('vault_filters', JSON.stringify({
      ...filters,
      searchPhrase: ''
    }));
  } catch (err) {}

  return {
    filters,
    filteredPools: getFilteredPools(pools, tokens, filters, categories),
    setCategoriesFilter: setCategoriesAction,
    setDepositedFilter: setDepositedAction,
    setWithBalanceFilter: setWithBalanceAction,
    setSearchPhrase: setSearchPhraseAction,
    setSort: setSortAction
  }
}

export function reducer(state, action) {
  const { filters } = state;

  switch (action.type) {
    case VAULT_FILTERS_SET_CATEGORIES:
      return {
        ...state,
        filters: {
          ...filters,
          categories: action.data
        }
      }

    case VAULT_FILTERS_SET_DEPOSITED:
      return {
        ...state,
        filters: {
          ...filters,
          deposited: action.data
        }
      }

    case VAULT_FILTERS_SET_WITH_BALANCE:
      return {
        ...state,
        filters: {
          ...filters,
          withBalance: action.data
        }
      }

    case VAULT_FILTERS_SET_SEARCH_PHRASE:
      return {
        ...state,
        filters: {
          ...filters,
          searchPhrase: action.data
        }
      }

    case VAULT_FILTERS_SET_SORT:
      return {
        ...state,
        filters: {
          ...filters,
          sort: action.data
        }
      }

    default:
      return state;
  }
}
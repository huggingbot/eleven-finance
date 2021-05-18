import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';
import NumberFormat from 'react-number-format';
import _ from 'lodash';


import Filters from '../Filters/Filters';
import Pool from '../Pool/Pool';

import { useConnectWallet } from '../../../home/redux/hooks';
import {
  useFetchBalances,
  useFetchFilters,
  useFetchPoolBalances,
  useFetchPoolsInfo,
  useFetchFarmsStaked
} from '../../redux/hooks';

import styles from './styles.js';
const useStyles = createUseStyles(styles);

export default function PoolsList({ filtersCategory }) {
  const { t } = useTranslation();
  const classes = useStyles();

  const { web3, address, networkId } = useConnectWallet();
  let { pools, fetchPoolBalances, fetchPoolBalancesDone } = useFetchPoolBalances();
  const { categories } = useFetchPoolsInfo();
  const { tokens, fetchBalances, fetchBalancesDone } = useFetchBalances();
  const { fetchFarmsStaked, fetchFarmsStakedDone } = useFetchFarmsStaked();
  const { filteredPools, setCategoriesFilter } = useFetchFilters(pools, tokens);

  const [fetchPoolDataDone, setFetchPoolDataDone] = useState(false);

  const [data, setData] = useState([]);

  useEffect(() => {
    if (filtersCategory) {
      categories.forEach(category => {
        if (category.name.toLowerCase() == filtersCategory.toLowerCase()) {
          setCategoriesFilter([category.name]);
        }
      })
    }

    loadData();
  }, []);

  useEffect(() => {
    if (fetchPoolBalancesDone && fetchFarmsStakedDone) {
      setFetchPoolDataDone(true);
    }
  }, [fetchPoolBalancesDone, fetchFarmsStakedDone])

  const loadData = async () => {
    const response = await fetch("https://eleven.finance/api.json");
    const json = await response.json();

    const normalizedData = pools.map((pool) => {
      let token = pool.token;
      let vault = json[token]?.vault;
      let tvl = json[token]?.tvl;
      pool["vault"] = vault;
      pool["tvl"] = tvl;
      pool['price'] = json[token]?.price;
      pool['farmStats'] = json[token]?.farm;

      if (pool.id == 'elebnb' && json[token]) {
        pool.farmStats = {
          apy: json[token].apy
        }
      }

      const poolStats = pool.claimable
        ? pool.vault
        : pool.farmStats;

      pool.apy = poolStats?.apy;
      pool.apr = poolStats?.apr;

      return pool;
    });

    normalizedData["totalvaluelocked"] = json["totalvaluelocked"]

    setData(normalizedData);
  }

  useEffect(() => {
    const fetch = () => {
      if (address && web3) {
        fetchBalances({ address, web3, tokens });
        fetchPoolBalances({ address, web3, pools });
        fetchFarmsStaked({ address, web3, pools});
      }
    }

    fetch();

    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [address, web3, fetchBalances, fetchPoolBalances]);

  return (
    <>
      <h2 className={classes.h2}>{t('Vault-Main-Title')}</h2>
      <h3 className={classes.h3}>
        TVL: <NumberFormat value={data.totalvaluelocked} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
      </h3>

      <Filters />

      {/* Pools */}
      <div className={classes.pools}>
        {Boolean(networkId === Number(process.env.NETWORK_ID)) && filteredPools.map((pool, index) => {
          return (
            <Pool key={index}
              pool={pool}
              index={index}
              tokens={tokens}
              fetchBalancesDone={fetchBalancesDone}
              fetchPoolDataDone={fetchPoolDataDone}
            />
          )
        })}
      </div>
    </>
  )
}
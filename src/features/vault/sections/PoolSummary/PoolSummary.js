import React from 'react';
import BigNumber from 'bignumber.js';
import { createUseStyles } from 'react-jss';
import millify from 'millify';
import { formatDecimals } from 'features/helpers/bignumber';

import Loader from 'components/Loader/Loader';

import styles from './styles';
const useStyles = createUseStyles(styles);

const parseToReadableNum = (num) => {
  // 10e1 === 100
  if (num < 10e2) {
    return num.toFixed(2)
  } else if (num >= 10e2 && num < 10e5) {
    return (num / 10e2).toFixed(2) + 'K'
  } else if (num >= 10e5 && num < 10e8) {
    return (num / 10e5).toFixed(2) + 'M'
  } else if (num >= 10e8 && num < 10e11) {
    return (num / 10e8).toFixed(2) + 'B'
  } else {
    return '∞'
  }

}

const PoolSummary = ({ pool, tokenBalance, depositedBalance, fetchBalanceDone, onClick }) => {
  const classes = useStyles();

  const units = ['', 'K', 'M', 'B', 'T', 'Q', 'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion',
    'Decillion', 'Undecillion'];

  const isCompounding = pool.earnContractAddress && ! pool.claimable;

  const getApy = pool => {
    const stats = pool.claimable
      ? pool.vault
      : pool.farmStats;

    if (stats === undefined) {
      return "";
    }

    const vaultApy = stats.apy;
    try {
      return millify(vaultApy, { units });
    } catch {
      return Number.parseFloat(vaultApy).toExponential(2);
    }
  }

  const getAprd = pool => {
    const stats = pool.claimable
      ? pool.vault
      : pool.farmStats;

    if (stats === undefined) {
      return "";
    }

    const vaultAprd = isCompounding ? stats.aprd : stats.apy / 365;
    try {
      return millify(vaultAprd, { units });
    } catch {
      return "--"
    }
  }

  const getEleApr = pool => {
    if (pool.farmStats === undefined) {
      return "";
    }

    const eleApr = pool.farmStats.aprl;
    try {
      return millify(eleApr, { units, space: true });
    } catch {
      return '--'
    }
  }

  return (
    <>
      {pool.isDiscontinued && (
        <div className={classes.discontinuedMessage}>
          <span>Discontinued</span>

          { pool.discontinuedMessage || '' }
        </div>
      )}

      <div className={classes.poolSummary + (pool.isDiscontinued ? ' discontinued' : '')} onClick={onClick}>
        <div className={classes.poolInfo}>
          <div className={classes.logo}>
            <img src={require(`../../../../images/${pool.image || pool.token + '-logo.svg'}`)} />
          </div>

          <div className={classes.nameBlock}>
            <p className={classes.name}>{pool.token}</p>
            {/* <p className={classes.description}>{pool.uses}</p> */}
          </div>
        </div>

        {/* <div className={classes.counter}>
          <p>
            { fetchBalanceDone
              ? formatDecimals(tokenBalance)
              : (<Loader />) }
          </p>
          <p>Balance</p>
        </div>

        <div className={classes.counter}>
          <p>
            { depositedBalance !== null
              ? formatDecimals(depositedBalance)
              : (<Loader />)}
          </p>
          <p>Deposited</p>
        </div> */}

        <div className={classes.counter}>
        {typeof pool.depositFee === 'undefined'
            ? <Loader />
            : <p>{pool.depositFee}%</p>
          }
          <p>Deposit Fee</p>
        </div>

        <div className={classes.counter}>
          {typeof pool.apr === 'undefined'
            ? <Loader />
            : <p>{parseToReadableNum(pool.apr)}%</p>
          }
          <p>APR</p>
        </div>

        <div className={classes.counter}>
          {typeof pool.totalLiquidity === 'undefined'
            ? <Loader />
            : <p>${parseToReadableNum(pool.totalLiquidity)}</p>
          }
          <p>Liquidity</p>
        </div>

        <div className={classes.counter}>
          {typeof pool.apr === 'undefined'
            ? <Loader />
            : <p>{pool.multiplier}x</p>
          }
          <p>Multiplier</p>
        </div>

      </div>
    </>
  );

};

export default PoolSummary;
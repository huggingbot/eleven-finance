import React, { useState, useCallback, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Transition } from '@headlessui/react';
import BigNumber from 'bignumber.js';
import { byDecimals } from 'features/helpers/bignumber';

import PoolSummary from '../PoolSummary/PoolSummary';
import PoolDetails from '../PoolDetails/PoolDetails';

import styles from './styles';
const useStyles = createUseStyles(styles);

const Pool = ({ pool, index, tokens, fetchBalancesDone, fetchPoolDataDone }) => {
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(new BigNumber(0));
  // const [depositedBalance, setDepositedBalance] = useState(new BigNumber(0));
  const [stakedBalance, setStakedBalance] = useState(new BigNumber(0));
  const [nextHarvestUntil, setNextHarvestUntil] = useState(new BigNumber(0));
  // const [depositedAndStaked, setDepositedAndStaked] = useState(null);

  const toggleCard = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  useEffect(() => {
    if (tokens[pool.token]) {
      setTokenBalance(byDecimals(tokens[pool.token].tokenBalance, pool.tokenDecimals));
    }

    if (fetchPoolDataDone) {
      // const depositedBalance = pool.earnContractAddress
      //   ? byDecimals(tokens[pool.earnedToken].tokenBalance, pool.itokenDecimals).times(pool.pricePerFullShare)
      //   : new BigNumber(0);

      const _stakedBalance = (pool.stakedAmount || new BigNumber(0))
      const _nextHarvestUntil = (pool.nextHarvestUntil || new BigNumber(0))

      // setDepositedBalance(depositedBalance);
      setStakedBalance(_stakedBalance);
      setNextHarvestUntil(_nextHarvestUntil);
      // setDepositedAndStaked(depositedBalance.plus(stakedBalance));
    }
  }, [tokens, pool, fetchPoolDataDone])

  return (
    <div key={pool.id}
      className={classes.pool}
    >
      <PoolSummary pool={pool}
        tokenBalance={tokenBalance}
        // depositedBalance={depositedAndStaked}
        fetchBalanceDone={fetchBalancesDone}
        onClick={toggleCard}
      />

      <Transition
        show={isOpen}
        enter={classes.transitionSlide}
        enterFrom={classes.transitionSlideClosed}
        enterTo={classes.transitionSlideOpen}
        leave={classes.transitionSlide}
        leaveFrom={classes.transitionSlideOpen}
        leaveTo={classes.transitionSlideClosed}
      >
        <PoolDetails pool={pool}
          index={index}
          tokenBalance={tokenBalance}
          // depositedBalance={depositedBalance}
          stakedBalance={stakedBalance}
          nextHarvestUntil={nextHarvestUntil}
        />
      </Transition>
    </div>
  );
};

export default Pool;
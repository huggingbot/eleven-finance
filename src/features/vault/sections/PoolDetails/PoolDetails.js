import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

import Grid from '@material-ui/core/Grid';

import { useConnectWallet } from 'features/home/redux/hooks';
import { useFetchPoolRewards } from 'features/vault/redux/fetchPoolRewards';

// import Claimable from './Layouts/Claimable';
import FarmOnly from './Layouts/FarmOnly';
// import WithFarm from './Layouts/WithFarm';

import styles from './styles';
const useStyles = createUseStyles(styles);

const PoolDetails = ({ pool, index, tokenBalance, /* depositedBalance, */ stakedBalance, nextHarvestUntil, refAddress }) => {
  const classes = useStyles();

  const { web3, address } = useConnectWallet();
  const { pendingRewards, fetchPoolRewards, fetchPoolRewardsDone } = useFetchPoolRewards();

  useEffect(() => {
    const fetch = () => {
      if (address && web3) {
        fetchPoolRewards({ address, web3, pool })
      }
    };
    fetch();

    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [address, web3, fetchPoolRewards]);

  return (
    <Grid item container xs={12} className={classes.poolDetails}>
      {/* {pool.farm && pool.earnContractAddress && (
        <WithFarm pool={pool}
          index={index}
          tokenBalance={tokenBalance}
          depositedBalance={depositedBalance}
          stakedBalance={stakedBalance}
          pendingRewards={pendingRewards[pool.id]}
          pendingRewardsLoaded={fetchPoolRewardsDone[pool.id]} />
      )} */}

      {pool.farm && !pool.earnContractAddress && (
        <FarmOnly pool={pool}
          index={index}
          tokenBalance={tokenBalance}
          stakedBalance={stakedBalance}
          nextHarvestUntil={nextHarvestUntil}
          pendingRewards={pendingRewards[pool.id]}
          pendingRewardsLoaded={fetchPoolRewardsDone[pool.id]}
          refAddress={refAddress}
        />
      )}

      {/* {pool.claimable && (
        <Claimable pool={pool}
          index={index}
          tokenBalance={tokenBalance}
          depositedBalance={depositedBalance}
          pendingRewards={pendingRewards[pool.id]}
          pendingRewardsLoaded={fetchPoolRewardsDone[pool.id]} />
      )} */}
    </Grid>
  );
}

export default PoolDetails;
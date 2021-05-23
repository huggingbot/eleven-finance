import React from 'react';
import { createUseStyles } from 'react-jss';
import { useLocation } from 'react-router-dom'
import { useConnectWallet } from './redux/hooks'
import styles from './referralStyles';
const useStyles = createUseStyles(styles);

export default function Referrals() {
  const classes = useStyles();
  const { connected } = useConnectWallet()
  const { pathname } = useLocation()
  console.log('pathname', pathname)

  if (!connected) {
    return null
  }

  return (
    <div className={classes.grid}>
        <div className={classes.box}>
          hello
        </div>
        <div className={classes.box}>
          hello
        </div>
      <div className={`${classes.box} ${classes.boxLast}`}>
        hello
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import Tippy from "@tippyjs/react";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
import Loader from "components/Loader/Loader";
import { useConnectWallet } from "../redux/hooks";
import { useCopy, useFetchReferrals } from "./hooks";
import styles from "./referralStyles";
const useStyles = createUseStyles(styles);

export default function Referrals() {
  const classes = useStyles();
  const { connected, address } = useConnectWallet();

  const [referral, setReferral] = useState("");
  const { copy, copied, reset } = useCopy(referral);
  const { referralsCount, totalReferralCommissions } = useFetchReferrals();

  useEffect(() => {
    if (address) {
      const base64address = Buffer.from(address).toString("base64");
      setReferral(`${window.location.origin}/?ref=${base64address}`);
    }
  }, [address]);

  if (!connected) {
    return null;
  }

  return (
    <div className={classes.grid}>
      <div className={classes.box}>
        Total Referrals
        <div className={classes.divider} />
        {referralsCount === null ? <Loader /> : referralsCount}
      </div>
      <div className={classes.box}>
        Total Referral Commissions
        <div className={classes.divider} />
        {totalReferralCommissions === null ? (
          <Loader />
        ) : (
          `${Number(totalReferralCommissions).toFixed(4)} NINI`
        )}
      </div>
      <div className={`${classes.box} ${classes.boxLast}`}>
        <div className={classes.referralLinkTitle}>
          Your Referral Link
          <Tippy
            placement="left"
            content="Copied!"
            visible={copied}
            onClickOutside={reset}
          >
            <button className={classes.copyButton} onClick={copy}>
              <ClipboardCopyIcon height="24px" />
            </button>
          </Tippy>
        </div>
        <div className={classes.divider} />
        <a
          href={referral}
          className={classes.referralLinkBody}
          target="_blank"
          rel="noopener noreferrer"
        >
          {referral}
        </a>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { referralContractABI, Address } from "../../configure";
import { MultiCall } from "eth-multicall";
import { getNetworkMulticall } from "features/helpers/getNetworkData";
import { useConnectWallet } from "../redux/hooks";

export const useCopy = (str) => {
  const [copied, setCopied] = useState(false);
  const reset = () => setCopied(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return { copy, copied, reset };
};

export function useFetchReferrals() {
  const { web3, address } = useConnectWallet();
  const [referralInfo, setReferralInfo] = useState({ referralsCount: null, totalReferralCommissions: null });

  useEffect(() => {
    if (web3 && address) {
      const fetchReferrals = async () => {
        const referralContract = new web3.eth.Contract(
          referralContractABI,
          Address.REFERRAL
        );
        const referralCall = [
          {
            referralsCount: referralContract.methods.referralsCount(address),
            totalReferralCommissions:
              referralContract.methods.totalReferralCommissions(address),
          },
        ];
        const multicall = new MultiCall(web3, getNetworkMulticall());
        const data = await multicall.all([referralCall]);

        setReferralInfo({
          referralsCount: data[0][0].referralsCount,
          totalReferralCommissions: data[0][0].totalReferralCommissions,
        });
      };
      fetchReferrals();
    }
  }, [web3, address]);

  return referralInfo;
}

import { vaultFarmAbi } from '../configure/abi';
import BigNumber from 'bignumber.js';

export const fetchPendingReward = async ({ web3, address, earnContractAddress, tokenName}) => {
    const contract = new web3.eth.Contract(vaultFarmAbi, earnContractAddress);
    const reward = await contract.methods['pending' + tokenName](address).call({ from: address });

    return new BigNumber(reward);
}
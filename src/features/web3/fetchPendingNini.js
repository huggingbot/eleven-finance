import { pool4Abi } from '../configure/abi';
import BigNumber from 'bignumber.js';

export const fetchPendingNini = async ({ web3, address, earnContractAddress, masterchefPid}) => {
    const contract = new web3.eth.Contract(pool4Abi, earnContractAddress);
    const reward = await contract.methods.pendingNini(masterchefPid, address).call({ from: address });

    return new BigNumber(reward);
}
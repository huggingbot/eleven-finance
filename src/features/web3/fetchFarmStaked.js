import { pool4Abi } from '../configure/abi';
import BigNumber from 'bignumber.js';

export const fetchFarmStaked = async ({ web3, address, earnContractAddress, earnContractAbi, masterchefPid }) => {
    const contract = new web3.eth.Contract(earnContractAbi || pool4Abi, earnContractAddress);
    const balance = await contract.methods.userInfo(masterchefPid, address).call({ from: address });

    return new BigNumber(balance.amount);
}
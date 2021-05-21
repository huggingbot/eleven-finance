import { Address } from './addresses'

export const categories = [
  {
    name: 'Bigfoot',
    default: true
  },
  {
    name: 'Pancake',
    default: true
  },
  {
    name: 'Nerve',
    default: true
  },
  {
    name: 'Wault',
    default: true
  },
  {
    name: 'Popsicle',
    default: true
  },
  {
    name: 'Ellipsis',
    default: true
  }
]

// id: '池子id',
// name: '池子名字',
// token: '池子代币',
// tokenDescription: '代币描述',
// tokenAddress: '代币ERC20地址',
// tokenDecimals: '存入精度'
// itokenDecimals: '提取精度'
// depostLimit: '存入最大数量限制' 0时不限制
// earnedToken: '奖励代币',
// earnedTokenAddress: '奖励代币ERC20地址',
// earnContractAddress: '池子合约地址',
// price ： 挖的代币的价格！
// path price:

// Testnet
export const pools = [
  {
    id: 0,
    name: 'NINI-AVAX LP',
    token: 'NINI-AVAX LP',
    tokenDescription: 'NINI-AVAX LP',
    tokenDecimals: 18,
    uses: '',
    itokenDecimals: 18,
    depostLimit: 0,
    tokenDescriptionUrl: '',
    tokenDescriptionUrl2: '',
    earnedToken: 'NINI',
    earnedTokenAddress: Address.NINI_TOKEN,
    defaultApy: "39.54",
    pricePerFullShare: 1,
    pastPricePerFullShare: 1,
    lpTokenAddress: Address.NINI_AVAX_LP,
    tokenAddress: Address.NINI_TOKEN,
    quoteTokenAddress: Address.WAVAX_TOKEN,
    categories: ['Pancake'],

    farm: {
      earnedToken: 'NINI',
      earnedTokenDecimals: 18,
      earnedTokenAddress: Address.NINI_TOKEN,
      earnContractAddress: Address.MASTERCHEF,
      masterchefPid: 0
    }
  },
  // {
  //   id: 'elebnb',
  //   name: 'ELE-BNB LP V2',
  //   token: 'ELE-BNB LP V2',
  //   tokenDescription: 'ELE-BNB LP V2',
  //   tokenDecimals: 18,
  //   uses: 'Uses pancakeswap',
  //   itokenDecimals: 18,
  //   depostLimit: 0,
  //   tokenDescriptionUrl: '',
  //   tokenDescriptionUrl2: '',
  //   earnedToken: 'ELE-BNB LP V2',
  //   earnedTokenAddress: '0xa9338126a645aca52aa74ce65fbc1092eb67d335',
  //   defaultApy: "39.54",
  //   pricePerFullShare: 1,
  //   pastPricePerFullShare: 1,
  //   lpTokenAddress: '0xa9338126a645aca52aa74ce65fbc1092eb67d335',
  //   categories: ['Pancake'],

  //   farm: {
  //     earnedToken: 'ELE',
  //     earnedTokenDecimals: 18,
  //     earnedTokenAddress: '0xAcD7B3D9c10e97d0efA418903C0c7669E702E4C0',
  //     earnContractAddress: '0x1ac6c0b955b6d7acb61c9bdf3ee98e0689e07b8a',
  //     masterchefPid: 104
  //   }
  // },
];

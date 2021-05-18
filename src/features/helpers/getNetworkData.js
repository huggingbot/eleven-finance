export const getNetworkMulticall = () => {
  switch (process.env.NETWORK_ID) {
    case '56':
      return '0xB94858b0bB5437498F5453A16039337e5Fdc269C';
    default:
      return '';
  }
}

export const getNetworkTokenShim = () => {
  switch (process.env.NETWORK_ID) {
    case '56':
      return '0xC72E5edaE5D7bA628A2Acb39C8Aa0dbbD06daacF';
    default:
      return '';
  }
}
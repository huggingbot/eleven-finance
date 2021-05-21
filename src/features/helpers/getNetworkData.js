export const getNetworkMulticall = () => {
  switch (process.env.NETWORK_ID) {
    case '1':
      return '0xceF16b5098328F665d1239Cc5b32CD3cd90626eF';
    default:
      return '';
  }
}

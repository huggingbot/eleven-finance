import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { createUseStyles } from "react-jss";
import { SnackbarProvider } from 'notistack';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { Notifier } from "features/common"

import { useConnectWallet, useDisconnectWallet } from './redux/hooks';

import Sidebar from './Sidebar/Sidebar';

import appStyle from "./jss/appStyle.js";
const useStyles = createUseStyles(appStyle);

export default function App({ children }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { connectWallet, web3, address, networkId, connected, connectWalletPending } = useConnectWallet();
  const { disconnectWallet } = useDisconnectWallet();
  const [ web3Modal, setModal ] = useState(null)

  useEffect(() => {
    const newModal = new Web3Modal({
      network: process.env.NETWORK ? process.env.NETWORK : "mainet",
      cacheProvider: true,
      providerOptions: {
        injected: {
          display: {
            name: "Injected",
            description: i18next.t('Home-BrowserWallet')
          },
        },
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.INFURA_ID
          }
        },
        'custom-binance': {
          display: {
            name: 'Binance',
            description: 'Binance Chain Wallet',
            logo: require(`../../images/wallets/binance-wallet.png`),
          },
          package: 'binance',
          connector: async (ProviderPackage, options) => {
            const provider = window.BinanceChain;
            await provider.enable();
            return provider;
          },
        },
      }
    })
    setModal(newModal)
  }, [setModal])

  useEffect(() => {
    if (web3Modal && (web3Modal.cachedProvider || window.ethereum)) {
      connectWallet(web3Modal);
    }
  }, [web3Modal, connectWallet, window.ethereum])

  useEffect(() => {
    if (web3 && address && !connectWalletPending && networkId && Boolean(networkId !== Number(process.env.NETWORK_ID))) {
      console.log('networkId', networkId)
      alert(t('App-SnackBarText'))
    }
  }, [web3, address, networkId])

  return (
    <SnackbarProvider>
      <div className={classes.page}>
        <Sidebar
          address={address}
          connected={connected}
          connectWallet={() => connectWallet(web3Modal)}
          disconnectWallet={() => disconnectWallet(web3, web3Modal)}
        />

        <div className={classes.container}>
          <div className={classes.children}>
            {Boolean(networkId === Number(process.env.NETWORK_ID)) && children}
            <Notifier />
          </div>
        </div>
      </div>
    </SnackbarProvider>
  );
}

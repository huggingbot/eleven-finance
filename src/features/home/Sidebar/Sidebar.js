import React, { Fragment, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Transition } from '@headlessui/react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import { useConnectWallet, useFetchTokenPrice } from '../redux/hooks';

import Loader from 'components/Loader/Loader';
import {
  LightningBoltIcon,
  DocumentTextIcon,
  ExternalLinkIcon,
  FingerPrintIcon,
  MenuIcon
} from '@heroicons/react/outline'

import logo from 'assets/img/logo.png';
import bscLogo from 'assets/img/networks/binance.png';
import twitterLogo from 'assets/img/socials/twitter.png';
import telegramLogo from 'assets/img/socials/telegram.png';
import mediumLogo from 'assets/img/socials/medium.png';
import githubLogo from 'assets/img/socials/github.png';

import styles from './styles';
const useStyles = createUseStyles(styles);

const Sidebar = ({ connected, address, connectWallet, disconnectWallet }) => {
  const classes = useStyles();
  const { web3 } = useConnectWallet();
  const { tokenPriceUsd, fetchTokenPrice, fetchTokenPriceDone } = useFetchTokenPrice();

  const [isOpen, setIsOpen] = useState(false);
  const [shortAddress, setShortAddress] = useState('');

  isOpen ? disableBodyScroll(document) : enableBodyScroll(document)

  useEffect(() => {
    const fetch = () => {
      if (web3) {
        fetchTokenPrice({ web3 });
      }
    }

    fetch();

    const id = setInterval(fetch, 60000);
    return () => clearInterval(id);
  }, [web3])

  useEffect(() => {
    if (! connected) {
      return;
    }

    if (address.length < 11) {
      setShortAddress(address)
    } else {
      setShortAddress(`${address.slice(0, 6)}...${address.slice(-4)}`)
    }
  }, [address])

  const onMobileButtonClick = () => {
    setIsOpen(true);
  }

  const onOverlayClick = () => {
    setIsOpen(false);
  }

  return (
    <>
      <div className={classes.mobileButton}>
        <button onClick={onMobileButtonClick}>
          <MenuIcon />
        </button>
      </div>

      <Transition
        show={isOpen}
        as={Fragment}
        enter={classes.transitionOpacity}
        enterFrom={classes.transitionOpacityClosed}
        enterTo={classes.transitionOpacityOpen}
        leave={classes.transitionOpacity}
        leaveFrom={classes.transitionOpacityOpen}
        leaveTo={classes.transitionOpacityClosed}
      >
        <div
          className={classes.overlay}
          onClick={onOverlayClick}
        ></div>
      </Transition>

      <div className={classes.sidebar + (isOpen ? ' open' : '')}>
        <div className={classes.sidebarInner}>
          {/* Logo */}
          <a href="#" className={classes.logo}>
            <img src={logo} />
            PANINISWAP
          </a>

          <div>
            {/* Network */}
            <div className={classes.network}>
              <img src={bscLogo} />
              <span>Avalanche</span>

              <div className={classes.networkStatus + ' connected'}></div>
            </div>

            {/* Wallet */}
            <button className={classes.wallet}
              onClick={connected ? disconnectWallet : connectWallet}
            >
              <FingerPrintIcon />
              { connected && shortAddress ? shortAddress : 'WALLET' }
            </button>
          </div>

          <div className={classes.divider}></div>

          <ul className={classes.menu}>
            <li className={classes.menuItem + ' active'}>
              <a href="/#/vault">
                <LightningBoltIcon />
                Pools
              </a>
            </li>

            <li className={classes.menuItem}>
              <a href="https://11eleven-11finance.gitbook.io/eleven-finance/" target="_blank">
                <DocumentTextIcon />
                Documentation
              </a>
            </li>
          </ul>
        </div>

        <div className={classes.bottom}>
          {/* Price & Buy */}
          <div className={classes.priceBlock}>
            <div className={classes.price}>
              <img src={logo} />
              { fetchTokenPriceDone
                ? '$' + (tokenPriceUsd ? tokenPriceUsd.toFixed(4) : '--')
                : <Loader />
              }
            </div>
            <div>
              <a className={classes.buyButton}
                href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0"
                target="_blank"
              >
                <ExternalLinkIcon />
                Buy NINI
              </a>
            </div>
          </div>

          <div className={classes.divider + ' small'}></div>

          {/* Social Links */}
          <div className={classes.socials}>
            <a href="https://twitter.com/elevenfinance" target="_blank">
              <img src={twitterLogo} />
            </a>
            <a href="https://t.me/elevenfinance" target="_blank">
              <img src={telegramLogo} />
            </a>
            <a href="https://elevenfinance.medium.com/" target="_blank">
              <img src={mediumLogo} />
            </a>
            <a href="https://github.com/Eleven-Finance" target="_blank">
              <img src={githubLogo} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
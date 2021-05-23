import React, { Fragment, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { createUseStyles } from 'react-jss';
import { Transition } from '@headlessui/react';
import { useHistory, useLocation } from 'react-router-dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import { useConnectWallet, useFetchTokenPrice } from '../redux/hooks';

import Loader from 'components/Loader/Loader';
import {
  LightningBoltIcon,
  UsersIcon,
  DocumentTextIcon,
  ExternalLinkIcon,
  FingerPrintIcon,
  MenuIcon
} from '@heroicons/react/outline'

import logo from 'assets/img/logo.png';
import bscLogo from 'assets/img/networks/avax.png';
import twitterLogo from 'assets/img/socials/twitter.png';
import telegramLogo from 'assets/img/socials/telegram.png';
import mediumLogo from 'assets/img/socials/medium.png';
import githubLogo from 'assets/img/socials/github.png';

import styles from './styles';
const useStyles = createUseStyles(styles);

const Sidebar = ({ connected, address, connectWallet, disconnectWallet }) => {
  const classes = useStyles();
  const history = useHistory()
  const { pathname } = useLocation()
  const { web3 } = useConnectWallet();
  const { tokenPriceUsd, fetchTokenPrice, fetchTokenPriceDone } = useFetchTokenPrice();

  const [isOpen, setIsOpen] = useState(false);
  const [shortAddress, setShortAddress] = useState('');
  const [activeLink, setActiveLink] = useState({ pools: `${classes.menuItem} active`, referrals: classes.menuItem })

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

  const onLinkClick = useCallback(link => () => {
      setActiveLink(activeLink => Object.keys(activeLink).reduce((obj, _link) => {
        if (link === _link) {
          return { ...obj, [_link]: `${classes.menuItem} active`}
        } else {
          return { ...obj, [_link]: `${classes.menuItem}`}
        }
      }, {}))

      if (link === 'pools') {
        history.push('/')
      } else {
        history.push(`/${link}`)
      }
  }, [])
  const onPoolsLinkClick = useCallback(onLinkClick('pools'), [onLinkClick])
  const onReferralsLinkClick = useCallback(onLinkClick('referrals'), [onLinkClick])
  const onDocumentationClick = useCallback(() => window.open(
    'https://11eleven-11finance.gitbook.io/eleven-finance/',
    '_blank'
  ), [])

  useLayoutEffect(() => {
    if (pathname === '/') {
      onPoolsLinkClick()
    } else {
      onLinkClick(pathname.replace('/', ''))()
    }
  }, [pathname, onPoolsLinkClick, onLinkClick])

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
            <li className={activeLink.pools} onClick={onPoolsLinkClick}>
              <LightningBoltIcon />
              Pools
            </li>

            <li className={activeLink.referrals} onClick={onReferralsLinkClick}>
              <UsersIcon />
              Referrals
            </li>

            <li className={classes.menuItem} onClick={onDocumentationClick}>
              <DocumentTextIcon />
              Documentation
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
                href="https://app.pangolin.exchange/#/swap?outputCurrency=0x9C418b0afe5192a894Ad8D6947CaB8EAF363fEc8"
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
            <a href="https://github.com/paniniswap" target="_blank">
              <img src={githubLogo} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
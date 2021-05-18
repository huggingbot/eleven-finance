import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { byDecimals, calculateReallyNum, formatDecimals } from 'features/helpers/bignumber';
import { inputLimitPass, inputFinalVal } from 'features/helpers/utils';

import Dialog from 'components/Dialog/Dialog';
import Spinner from 'components/Spinner/Spinner';

import CustomSlider from 'components/CustomSlider/CustomSlider';

import styles from './styles';
const useStyles = createUseStyles(styles);

const AmountDialog = ({ title, buttonText, buttonIsLoading, balance, decimals, open, onConfirm, onClose }) => {
  const classes = useStyles();

  const [amount, setAmount] = useState({
    number: 0,
    slider: 0
  });

  const onEnter = () => {
    setAmount({
      number: 0,
      slider: 0
    });
  }

  const onInputChange = event => {
    let value = event.target.value;
    const total = balance.toNumber();

    if (!inputLimitPass(value, decimals)) {
      return;
    }

    let sliderNum = 0;
    let inputVal = 0;
    if (value) {
      inputVal = Number(value.replace(/,/g, ''));
      sliderNum = byDecimals(inputVal / total, 0).toFormat(2) * 100;
    }

    setAmount({
      number: inputFinalVal(value, total, decimals),
      slider: sliderNum,
    });
  };

  const onSliderChange = (_, sliderNum) => {
    const total = balance.toNumber();

    let amount = 0;

    if (sliderNum == 100) {
      amount = byDecimals(balance, 0).toFormat(decimals);
    } else if (sliderNum > 0) {
      amount = inputFinalVal(calculateReallyNum(total, sliderNum), total, decimals);
    }

    setAmount({
      number: amount,
      slider: sliderNum,
    });
  };

  const onBalanceButton = () => {
    setAmount({
      number: byDecimals(balance, 0).toFormat(decimals),
      slider: 100
    })
  }

  const onConfirmButton = () => {
    onConfirm((amount.number + '').replace(/,/g, ''));
  }

  const controls = (
    <>
      <button
        className={classes.button}
        onClick={onConfirmButton}
        disabled={buttonIsLoading}
      >
        {!buttonIsLoading
          ? buttonText
          : (<Spinner/>)}
      </button>
    </>
  )

  return (
    <>
      <Dialog open={open}
        onClose={onClose}
        title={title}
        controls={controls}
      >
        <div className={classes.labelWithAddon}>
            <label>Amount</label>
          <button className={classes.balanceButton}
            onClick={onBalanceButton}
          >
            max: <span>{ formatDecimals(balance) }</span>
          </button>
        </div>

        <input type="text"
          className={classes.input}
          value={amount.number}
          onChange={onInputChange}
        />

        {/* Slider */}
        <div className={classes.sliderWrapper}>
          <CustomSlider
            classes={{
              root: classes.sliderRoot,
              markLabel: classes.sliderMarkLabel,
            }}
            aria-labelledby="continuous-slider"
            value={amount.slider}
            valueLabelDisplay="off"
            onChange={onSliderChange}
          />
        </div>
      </Dialog>
    </>
  );
}

export default AmountDialog;
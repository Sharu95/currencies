import React, { Component } from "react";

import "./index.css";
import { floorCurrency } from '../../resources/currencies';

const AddOptionals = props => {
  return (
    <button onClick={props.addMore} className="rate add-rates">
      <span className="icon is-large">
        <i className="fa fa-cog fa-5x" />
      </span>
    </button>
  );
};

const RateTile = props => {
  const rateToBase = floorCurrency(1/props.rate);
  const rateToBaseText = "1 " + props.currency + " = " + rateToBase + " " + (props.baseFlag || props.base); 
  const baseToRateText = "1 " + props.base + " = " + props.rate + " " + (props.flag || props.currency); 
  let showRate = <span> {baseToRateText} <br /> {rateToBaseText} </span>;
  
  if (props.rate > rateToBase) {
    showRate = <span> {baseToRateText} </span>;
  } else if (props.rate < rateToBase) {
    showRate = <span> {rateToBaseText} </span>;
  }

  return (
    <div className="rate">
      <div className="rate-title">
        {props.currency}
        <span className="flag">{props.flag || ''}</span>
      </div>
      <section className="title-separator" />
      <section className="rate-values">
        {showRate}
        {/* <span> {"1 " + props.base + " = " + props.rate + " " + props.flag} </span>
        <br />
        <span> {"1 " + props.currency + " = " + floorCurrency(1/props.rate) + " " + props.baseFlag} </span> */}
      </section>
    </div>
  );
};

/**
 * User has configured: currency
 */
class UserView extends Component {

	state = {
		pressedSettings: false,
	};

  populateRates = (base, rates, flags) => {
    const baseFlag = flags.find(x => x.code === base.substr(0,2));
    return Object.keys(rates).map((rate, i) => {
      const code = rate.substr(0, 2);
      let flag = flags.find(x => x.code === code);
      if (!flag || !baseFlag) flag = "";
      return (
        <RateTile
          key={i}
          base={base}
          rate={rates[rate]}
          currency={rate}
          flag={flag.emoji}
          baseFlag={baseFlag.emoji}
        />
      );
    });
  };

  settingsOpen = (action) => {
		console.log('Settings is open');
		this.setState({pressedSettings: action});
	};
	
  render() {
		const { pressedSettings } = this.state; 
    const { rates, flags, base } = this.props;
    return (
      <div className="user-view">
        <div className="rates-container">
          {this.populateRates(base, rates, flags)}
        </div>
      </div>
    );
  }
}

export default UserView;

import React, { Component } from "react";

import "./App.css";
import "./loader.css";
import "./config.css";
import data from "./emojis.json";
import { fetchCurrencies } from "./resources/currencies";
import { findFlags } from "./resources/flags";
import UserView from "./components/UserView";

const Loader = props => {
  return (
    <div className="container">
      <div className="loader-container">
        <div className="vertical-bar" />
        <div className="vertical-bar" />
        <div className="vertical-bar" />
        <div className="vertical-bar" />
        <div className="vertical-bar" />
        <div className="loading">{props.statusText}</div>
      </div>
    </div>
  );
};

const UserCurrency = props => {
  return (
    <div onClick={props.changeCurrency} className="navbar-watching-currency">
      <div>
        {props.flag}
        <span> {props.userCurrency} </span>
      </div>
    </div>
  );
};

const Tag = props => {
  return (
    <section
      onClick={props.onSelected}
      className={`config-tag ${props.selected}`}
    >
      {props.flag + " " + props.currency}
    </section>
  );
};

const UserConfiguration = props => {
  if (!props.currencies) return "";

  let title = "My currency";

  if (props.userCurrency) title = "Currencies I want to watch";

  return (
    <div className="config-view">
      <section className="config-title"> {title} </section>
      <div className="tags-container">
        {props.currencies
          .filter(x => x !== props.userCurrency)
          .map((currency, i) => {
            const flag = findFlags([currency] ,data)[0].emoji;
            const selected = props.selected.includes(currency)
              ? "selected"
              : "";
            const selectedAction = props.userCurrency
              ? props.handlers.onSelected(currency)
              : props.handlers.setUser(currency);
            return (
              <Tag
                selected={selected}
                onSelected={selectedAction}
                key={i}
                flag={flag}
                currency={currency}
              />
            );
          })}
      </div>
      {props.userCurrency && (
        <div
          onClick={props.handlers.hasConfigured}
          className="config-tag config-action"
        >
          OK
        </div>
      )}
    </div>
  );
};

const initialState = {
  userCurrency: undefined,
  userHasConfigured: false,
  userConfiguration: [],
  hasFetchedRates: false,
  rates: {},
  flags: undefined,
  statusText: "Loading ..."
};

class App extends Component {
  state = initialState;

  saveUserConfiguration = updatedRates => {
    const { userCurrency, userConfiguration } = this.state;

    userConfiguration.push(userCurrency);
    const flags = findFlags(userConfiguration, data);
    const today = new Date();

    try {
      localStorage.setItem(
        "currenciesConfiguration",
        JSON.stringify({
          userCurrency: userCurrency,
          userHasConfigured: true,
          userConfiguration: userConfiguration,
          rates: updatedRates,
          flags: flags,
          date: {
            day: today.getDate(),
            month: today.getMonth(),
            year: today.getFullYear()
          }
        })
      );
    } catch (err) {
      this.setState({
        statusText:
          err + ": Could not save your configuration. You probably don't have enough space, and I got no space monkeys for rescue :("
      });
    }
  };

  hasFetchedConfigured = ({ rates }) => {
    this.saveUserConfiguration(rates);
    this.setState({
      hasFetchedRates: true,
      userHasConfigured: true,
      rates: rates
    });
  };

  hasConfigured = () => {
    const { rates, userConfiguration, userCurrency } = this.state;

    /* Destructive styles are not neat */
    Object.keys(rates).forEach(rate => {
      if (!userConfiguration.includes(rate)) {
        delete rates[rate];
      }
    });

    /* At this point, base is still EUR by default, 
       so there are two options; 
          - compute rates with usercurrency base 
          - or fetch again (not really scalable, heh) */
    if (rates[userCurrency] !== 1) {
      this.setState({ hasFetchedRates: false });
      fetchCurrencies(
        userCurrency,
        Object.keys(rates),
        this.hasFetchedConfigured
      );
    }
  };

  hasFetched = fetchedInfo => {
    const { rates } = fetchedInfo;
    console.log("Has fetched", fetchedInfo);

    rates[fetchedInfo.base] = "1.00";
    //TODO: data is global emojis.json. Fetch flags here
    const flags = findFlags(Object.keys(rates), data);

    this.setState({
      hasFetchedRates: true,
      rates: rates,
      flags: flags
    });
  };

  checkStorageOrFetch = () => {
    const foundConfigs = JSON.parse(
      localStorage.getItem("currenciesConfiguration")
    );

    if (foundConfigs) {
      const { day, month, year } = foundConfigs.date;
      const newDate = new Date();
      const timeChange =
        newDate.getDate() > day ||
        newDate.getMonth() > month ||
        newDate.getFullYear() > year;
      const after16PM = newDate.getHours() >= 16;

      if (timeChange && after16PM) {
        const { userCurrency, userConfiguration } = foundConfigs;
        fetchCurrencies(userCurrency, userConfiguration, this.hasFetched);
      } else {
        this.setState({ ...foundConfigs, hasFetchedRates: true });
      }
    } else {
      fetchCurrencies([], [], this.hasFetched);
    }
  };

  componentDidMount() {
    this.checkStorageOrFetch();
  }

  registerSelected = currency => () => {
    const { userConfiguration, rates } = this.state;
    const newConfig = userConfiguration;
    const alreadyChosen = newConfig.indexOf(currency);

    if (alreadyChosen === -1) {
      newConfig.push(currency);
    } else {
      newConfig.splice(alreadyChosen, 1);
    }
    this.setState({ userConfiguration: newConfig });
  };

  setUserCurrency = currency => () => {
    this.setState({ userCurrency: currency });
  };

  changeCurrency = () => {
    //TODO: initialState
    console.log('set initial state');
    // this.setState(initialState);
  };

  render() {
    const {
      hasFetchedRates,
      rates,
      flags,
      userHasConfigured,
      userConfiguration,
      userCurrency,
      statusText
    } = this.state;

    const configurationHandlers = {
      hasConfigured: this.hasConfigured,
      setUser: this.setUserCurrency,
      onSelected: this.registerSelected
    };

    let userCurrencyFlag = "";
    if (hasFetchedRates && userCurrency && flags)
      userCurrencyFlag = findFlags([userCurrency], flags)[0].emoji;

    return (
      <div className="background">
        <div className="navbar">
          <div className="navbar-title">Currency rates</div>
          {hasFetchedRates && (
            <UserCurrency
              changeCurrency={this.changeCurrency}
              flag={userCurrencyFlag}
              userCurrency={userCurrency || "Choose currency below"}
            />
          )}
        </div>
        {!hasFetchedRates && <Loader statusText={statusText} />}

        {!userHasConfigured &&
          hasFetchedRates && (
            <UserConfiguration
              handlers={configurationHandlers}
              userCurrency={userCurrency}
              currencies={Object.keys(rates)}
              selected={userConfiguration}
            />
          )}

        {userHasConfigured &&
          hasFetchedRates && (
            <UserView base={userCurrency} rates={rates} flags={flags} />
          )}
      </div>
    );
  }
}

export default App;

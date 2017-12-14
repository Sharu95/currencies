/* Dev */

// const ENDPOINT = "http://localhost:8080/";
const ENDPOINT = "https://api.fixer.io/";

export function floorCurrency(value) {
  return (Math.round(value * 1000) / 1000).toFixed(3);
}

export function fetchCurrencies(userCurrency, watching, hasFetched) {
  let reqUrl = `${ENDPOINT}latest`;

  if (userCurrency.length !== 0) {
    reqUrl += `?base=${userCurrency}`;
  }

  if (watching.length !== 0) {
    reqUrl += `&symbols=${watching}`;
  }

  console.log('Fetching in API', reqUrl);

  fetch(reqUrl)
    .then(response => {
      return response.json();
    })
    .then(result => {
      Object.keys(result.rates).forEach(currency => {
        const rate = result.rates[currency];
        result.rates[currency] = floorCurrency(rate);
      });
      // console.log("Currencies", result);
			return hasFetched(result);
    })
    .catch(err => {
      console.log("Error", err);
    });
}

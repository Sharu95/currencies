export function findFlags(currencies, allFlags) {
  return currencies
    .map(x => x.substr(0, 2))
    .map(countryCode =>
      allFlags.find(flagObject => flagObject.code === countryCode)
    );
}

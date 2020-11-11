# Commute Insurance

A basic insurance contract that pays out the covered amount each time your morning commuter train is late by more than 30 minutes.

### 10,000 foot view
MBTA API -> Chainlink Oracle -> Agoric Contract

## To Develop

###### Shell A

Run agoric node:
```
cd commute-insurance
agoric start --reset
```

##### Shell B

Deploy contract, instantiate contract (deploy api), start browser client:
```
cd commute-insurance
agoric deploy contract/deploy.js
agoric deploy --allow-unsafe-plugins api/deploy.js
(cd ui && yarn start)
```

To test locally, go to localhost:3000 > "Query Oracle" > you should get the arrival time of the next train (train info hardcoded for now).

##### Shell C

To open wallet in browser:
```
agoric open
```

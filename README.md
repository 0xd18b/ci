# Commute Insurance

A POC for a basic insurance contract that mints tokens if the queried train time is not equal to the expected train time.

The idea is that if you could do logic like the above you could build some interesting risk intruments like insurance contracts against your commute time. Or commuter tickets that decay in price the later the train is.

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


## TODO:

- copy oracle.js into contract.js and import { trade } from zoe
- extremely simple vue UI. what's the API call look like?
- model from demo site
-

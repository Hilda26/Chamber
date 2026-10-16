# Public verification evidence

`deployment.json` records the current deployed contract. `live-lifecycle.json` is the latest live verification journal; only `status: PASSED` represents a completed lifecycle. It contains real faucet-funded StudioNet integration transactions, not customer activity.

`history/` retains earlier interrupted and diagnostic runs. The old contract deployment there used an internal GenVM message for withdrawal. A real live test identified the error, and the current contract uses an external EVM native-value message. Subsequent diagnostic runs exposed SDK receipt simplification; the app now validates complete transaction fields. These history files are not passing test claims.

Screenshots show the actual application UI. Signing keys and local hosting credentials are excluded from this repository.

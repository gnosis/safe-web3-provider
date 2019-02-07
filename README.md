# Safe Web3 Provider

This provider is injected by the [Safe Browser Extension](https://github.com/gnosis/safe-browser-extension) when Dapps are whitelisted in the extension.

It's highly recommended to integrate it in your Dapp to asure a good performance.

## Installation
```
npm install github:gnosis/safe-web3-provider#v1.0.1 -S
```

## Usage
```js
import Web3 from 'web3'
import SafeProvider from 'safe-web3-provider'

/**
 *  Create Safe Provider
 */
const provider = new SafeProvider()

/**
 *  Create Web3
 */
const web3 = new Web3(provider)

/**
 *  Get Accounts
 */
const accounts = await web3.eth.getAccounts()

/**
 * Send Transaction
 */
const txHash = await web3.eth.sendTransaction(tx)

// ...

```

import ProviderEngine from 'web3-provider-engine'
import SubscriptionSubprovider from 'web3-provider-engine/subproviders/subscriptions.js'
import DefaultFixture from 'web3-provider-engine/subproviders/default-fixture.js'
import NonceTrackerSubprovider from 'web3-provider-engine/subproviders/nonce-tracker.js'
import SanitizingSubprovider from 'web3-provider-engine/subproviders/sanitizer.js'
import FetchSubprovider from 'web3-provider-engine/subproviders/fetch.js'

import SafeSubprovider from './SafeSubprovider'

const SafeProvider = function () {
  const engine = new ProviderEngine()

  engine.setMaxListeners(0)

  // Metamask methods are temporary. Must be deleted in the future.
  engine.isMetaMask = !0
  engine._metamask = {
    isApproved: function () {
      return true
    },
    isUnlocked: function () {
      return true
    }
  }

  engine.isSafe = true
  engine.isConnected = function () {
    return true
  }

  engine.addProvider(new SafeSubprovider())

  // static
  const staticSubprovider = new DefaultFixture()
  engine.addProvider(staticSubprovider)

  // nonce tracker
  engine.addProvider(new NonceTrackerSubprovider())

  // sanitization
  const sanitizer = new SanitizingSubprovider()
  engine.addProvider(sanitizer)

  const filterAndSubsSubprovider = new SubscriptionSubprovider()
  // forward subscription events through provider
  filterAndSubsSubprovider.on('data', function (err, notification) {
    engine.emit('data', err, notification)
  })
  engine.addProvider(filterAndSubsSubprovider)

  const sendAsync = function (payload, cb) {
    engine.sendAsync(payload, cb)
  }

  const sendSync = function (payload) {
    // eslint-disable-next-line
    var r = undefined
    switch (payload.method) {
      case 'eth_accounts':
        r = engine.currentSafe ? [engine.currentSafe] : []
        break
      case 'eth_coinbase':
        r = engine.currentSafe || null
        break
      case 'eth_uninstallFilter':
        sendAsync(payload, function () { })
        r = true
        break
      default:
        throw new Error('SafeProvider does not support this synchronous request', payload)
    }
    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result: r
    }
  }

  engine.send = function (payload, callback) {
    if (callback) {
      sendAsync(payload, callback)
    } else {
      return sendSync(payload)
    }
  }

  engine.enable = () => {
    return new Promise((resolve, reject) => {
      sendAsync({ method: 'eth_accounts', params: [] }, (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }

  const safeInitializeProviderHandler = function (data) {
    window.removeEventListener('EV_SAFE_INITIALIZE_PROVIDER', safeInitializeProviderHandler)
    const rpcUrl = data.detail.rpcUrl
    engine.addProvider(new FetchSubprovider({ rpcUrl }))
    engine.currentSafe = data.detail.safe
  }
  window.addEventListener('EV_SAFE_INITIALIZE_PROVIDER', safeInitializeProviderHandler)

  window.addEventListener('EV_SAFE_UPDATE_PROVIDER', function (data) {
    engine.currentSafe = data.detail
  })

  const safeProviderWaitingEvent = new window.CustomEvent('EV_SAFE_PROVIDER_WAITING')
  window.dispatchEvent(safeProviderWaitingEvent)

  engine.start()

  return engine
}

export default SafeProvider

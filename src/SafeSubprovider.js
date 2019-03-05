import uuid from 'uuid/v4'

class SafeSubprovider {
  sendTransaction(payload, end) {
    const id = uuid()
    payload.params[0].id = id
    const showPopupEvent = new window.CustomEvent(
      'EV_SHOW_POPUP_TX',
      { detail: payload.params[0] }
    )
    window.dispatchEvent(showPopupEvent)
    const resolveTransactionHandler = function (data) {
      window.removeEventListener('EV_RESOLVED_TRANSACTION' + data.detail.id, resolveTransactionHandler)
      if (data.detail.hash) {
        end(null, data.detail.hash)
      } else {
        end(new Error('Transaction rejected', data.detail.id))
      }
    }
    window.addEventListener('EV_RESOLVED_TRANSACTION' + id, resolveTransactionHandler)
  }

  signTypedData(payload, end) {
    const showPopupSignEvent = new window.CustomEvent(
      'EV_SHOW_POPUP_SIGNATURE',
      { detail: payload.params }
    )
    window.dispatchEvent(showPopupSignEvent)
    const signedTypedDataHandler = function (data) {
      window.removeEventListener('EV_RESOLVED_WALLET_SIGN_TYPED_DATA', signedTypedDataHandler)

      if (data.detail.walletSignature) {
        end(null, data.detail.walletSignature)
      } else {
        end(new Error('Signature rejected'))
      }
    }
    window.addEventListener('EV_RESOLVED_WALLET_SIGN_TYPED_DATA', signedTypedDataHandler)
  }

  handleRequest(payload, next, end) {
    const account = this.engine.currentSafe
    switch (payload.method) {
      case 'eth_accounts':
        end(null, account ? [account] : [])
        return
      case 'eth_coinbase':
        end(null, account)
        return
      case 'eth_sendTransaction':
        this.sendTransaction(payload, end)
        return
      case 'wallet_signTypedData':
        this.signTypedData(payload, end)
        return
      default:
        next()
    }
  }

  setEngine(engine) {
    this.engine = engine
  }
}

export default SafeSubprovider

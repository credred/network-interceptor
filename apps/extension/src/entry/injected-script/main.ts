import { sendMessage, setNamespace } from 'webext-bridge/window'
import { networkEmitter, enable } from 'common/network-interceptor';

enable()

networkEmitter.on('request', (requestInfo) => {
  void sendMessage('request', requestInfo, 'devtools')
})

networkEmitter.on('response', (responseInfo) => {
  void sendMessage('response', responseInfo, 'devtools')
})

setNamespace('net-guard')

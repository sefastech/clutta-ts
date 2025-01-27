# clutta-js
Cluttajs is the official javascript library for interacting with Clutta, a platform for observability and monitoring. Use this SDK to send pulse data, either individually or in batches.


## USAGE

```js

const clutta = new Clutta({
  apiKey: 'yourCluttaAPIKEY',
  version: 'v0.0.10',
});


clutta.sendPulse({
  signatureId: 'signatureId',
  correlationId: 'correlationId',
  chainId: 'chainId',
  userId: 'uniqueUserId',
  sourceId: 'source',
  status: 1,
  statusDescription: 'Success',
});
```
# cloud-foundry-service-discovery

**Axios based cloud foundry service discovery client for node.js.**

**Enable nodejs application dynamically discover and resolve url of other regiesterd apps through cloud foundry service registry**

## Installing

Note: axios is a peer dependency.

```bash
npm install axios cloud-foundry-service-discovery
```

## Example

```js
import {resolveAppId} from 'cloud-foundry-service-discovery'

resolveAppId("appId").then(response=>console.log(appInstanceUrl)).catch(error=>console.log(error))
```

## Reference
[Pivotal Cloud Foundry Service Registry](https://docs.pivotal.io/spring-cloud-services/2-0/common/service-registry/index.html)
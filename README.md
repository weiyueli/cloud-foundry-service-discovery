# cloud-foundry-service-discovery

**Axios based cloud foundry service discovery client for node.js.**

**Enable nodejs application dynamically discover and call other regiesterd apps through cloud foundry service registry**

The API of cloud-foundry-service-discovery is identical to the API of axios.request, giving you familiar experience.

## Installing

Note: axios is a peer dependency.

```bash
npm install axios cloud-foundry-service-discovery
```

## Example

```js
import Disvoery from 'cloud-foundry-service-discovery'

Discovery.request({
    // simply send your request to http://${app-name}/path
    url: 'http://application/greeting'
})
.then(response=>console.log(response))
.catch(error=>console.log(error))
```

## Reference
[Pivotal Cloud Foundry Service Registry](https://docs.pivotal.io/spring-cloud-services/2-0/common/service-registry/index.html)

[NPM Axios](https://www.npmjs.com/package/axios#axiosrequestconfig-1)
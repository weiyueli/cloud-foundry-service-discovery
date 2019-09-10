import Axios, { AxiosRequestConfig } from "axios";
import Debug from "debug";
import { URL } from "url";
import * as NodeCache from "node-cache";
import * as QueryString from "querystring";

const debug = Debug("cloud-foundry-service-discovery");
const cache = new NodeCache({ stdTTL: 30 });

let credentials: any;

export function discover(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {

    const hostname = new URL(config.url ? config.url : "", config.baseURL).hostname;
    return setCredentials().then(() =>
        getCache(hostname)
            .then((cachedInstances) => resolveConfigUrl(cachedInstances, config))
            .catch((noCache) => getInstances(hostname)
                .then((instances) => setCache(hostname, instances).catch((reject) => reject))
                .then((instances) => resolveConfigUrl(instances, config))));
}

function getCache(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        cache.get(key, (err, value) => {
            if (err || !value) {
                reject(new Error("No cache found"));
                return;
            }
            debug("Found cache for %s", key);
            resolve(value as string[]);
        });
    });
}

function setCache(key: string, value: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
        cache.set(key, value, (err, success) => {
            if (err || !success) {
                debug("Error set cache");
                reject(value);
                return;
            }
            resolve(value);
        });
    });
}

function resolveConfigUrl(instances: string[], config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    return selectRandom(instances).then((instance) => {
        const instanceHost = new URL(instance).host;
        const configURL = new URL(config.url || "", config.baseURL);
        configURL.host = instanceHost;
        config.url = configURL.href;
        debug("Resolved request config: %j", config);
        return config;
    });
}

function selectRandom(instances: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        if (instances.length === 0) {
            reject(new Error("No healthy instances available"));
            return;
        }
        const randomIndex = Math.floor(Math.random() * Math.floor(instances.length));
        resolve(instances[randomIndex]);
    });
}

function setCredentials(): Promise<void> {
    return new Promise((resolve, reject) => {
        const vcapServices: string = process.env.VCAP_SERVICES || "";
        if (!vcapServices) {
            reject(new Error("Cloud Foundry enviroment variable VCAP_SERVICES is undefined"));
            return;
        }
        const pServiceRegistry = JSON.parse(vcapServices)["p-service-registry"];
        if (!pServiceRegistry) {
            reject(new Error("Cloud Foundry Service [Service Registry] is not binded to application"));
            return;
        }
        credentials = JSON.parse(vcapServices)["p-service-registry"][0].credentials;
        resolve();
    });
}

function getAccessToken(): Promise<string> {
    return Axios.request({
        method: "POST",
        url: credentials.access_token_uri,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: QueryString.stringify({
            client_id: credentials.client_id,
            client_secret: credentials.client_secret,
            grant_type: "client_credentials",
        }),
    }).then((response) => response.data.access_token)
        .catch((error) => new Error("Error in getting eureka server access token"));
}

function getInstances(hostname: string): Promise<string[]> {
    debug("Resolving hostname %s", hostname);
    return getAccessToken()
        .then((accessToken) => Axios.request({
            url: credentials.uri + "/eureka/apps/" + hostname,
            headers: {
                Authorization: "Bearer " + accessToken,
            },
            responseType: "document",
        }).then((response) => {
            const instances = response.data.application.instance
                .filter((i: any) => i.status === "UP")
                .map((i: any) => i.homePageUrl);
            debug("Hostname %s resolved to %j", hostname, instances);
            return instances;
        }));
}

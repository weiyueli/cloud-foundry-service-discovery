import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as ServiceDiscover from "./service-discover";

class Discovery {

    public static request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return ServiceDiscover.discover(config).then(Axios.request);
    }
}

export default Discovery;
export { Discovery };

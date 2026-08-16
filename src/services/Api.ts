import { authServiceConfig, getAuthServiceFactory } from "../mcp/factory/authFactory.js";
import { ExternalService } from "./config.js";

export class API {

    private serviceType: ExternalService;
    private factory: authServiceConfig;


    constructor(service: ExternalService){
        this.serviceType = service;
        this.factory =  getAuthServiceFactory(this.serviceType);
    }


    public getService() {
        return this.serviceType;
    }

    public getAuthServiceConfig(){
        return this.factory;
    }

}
import { authServiceConfig, getAuthServiceFactory } from "../mcp/factory/authFactory.js";
import { ExternalService } from "./config.js";

export class API {

    private serviceType: ExternalService;
    private factory: authServiceConfig;
    private isRemoteHeaderSupported;


    constructor(service: ExternalService){
        this.serviceType = service;
        this.factory =  getAuthServiceFactory(this.serviceType);
        if(this.factory.headerKey){
            this.isRemoteHeaderSupported = true;
        }else{
            this.isRemoteHeaderSupported = false;
        }
    }


    public getService() {
        return this.serviceType;
    }

    public getAuthServiceConfig(){
        return this.factory;
    }

    public getRemoteHeaderSupported(){
        return this.isRemoteHeaderSupported;
    }

}
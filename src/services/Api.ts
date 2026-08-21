import { ExternalService } from "./config.js";

export class API {

    private serviceType: ExternalService;

    constructor(service: ExternalService){
        this.serviceType = service;
    }


    public getService() {
        return this.serviceType;
    }


}
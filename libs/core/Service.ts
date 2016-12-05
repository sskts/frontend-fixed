import request = require('request');

export default class  Service {
    wsdl: string;

    constructor(wsdl: string) {
        this.wsdl = wsdl;
    }

    protected request(url: string, options: request.CoreOptions, cb: request.RequestCallback ): void {
        request(url, options, cb);
    }
}
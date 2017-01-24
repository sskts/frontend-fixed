export default class ExtError extends Error {
    public type: string | undefined;
    constructor(message: string | undefined ,type?: string) {
        super(message);
        this.type = (type) ? type : type;
    }
}


export class CustomError extends Error {
    public status: number;
    public message: string;

    constructor(message: string, status: number) {
        super(message);
        this.message = message;
        this.status = status;
    }
}

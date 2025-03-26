export interface IEnvironment {
    currentEnvironment: string | undefined;
    isLoaded: boolean;
}
export class Environment implements IEnvironment {
    public currentEnvironment: string | undefined;
    public static instance: Environment;
    private _isLoaded: boolean;
    public config: { loadEnvVariables(env: string): boolean };

    constructor(config: { loadEnvVariables(env: string): boolean }) {
        this.currentEnvironment = process.env.NODE_ENV;
        this._isLoaded = false;
        this.config = config;
        if (this.currentEnvironment) {
            if (config.loadEnvVariables(this.currentEnvironment)) {
                this._isLoaded = true;
            } else {
                this._isLoaded = false;
            }
        } else {
            this._isLoaded = false;
        }
    }

    public static initialize(config: { loadEnvVariables(env: string): boolean }) {
        if (!Environment.instance) {
            Environment.instance = new Environment(config);
        }
        return Environment.instance;
    }

    get isLoaded() {
        return this._isLoaded;
    }
}

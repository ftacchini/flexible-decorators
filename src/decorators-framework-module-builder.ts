import { ControllerLoader, PathControllerLoader } from "./controller";
import { DecoratorsFrameworkModule } from "./decorators-framework-module";

export class DecoratorsFrameworkModuleBuilder {

    private controllerLoader!: ControllerLoader;

    private static _instance: DecoratorsFrameworkModuleBuilder;
    public static get instance() {
        return this._instance || (this._instance = new DecoratorsFrameworkModuleBuilder());
    }

    private constructor() {
        this.reset();
    }

    public withControllerLoader(controllerLoader: ControllerLoader): this {
        this.controllerLoader = controllerLoader;
        return this;
    }

    public build() {

        let module: DecoratorsFrameworkModule = new DecoratorsFrameworkModule(
            this.controllerLoader || new PathControllerLoader()
        );

        this.reset();
        return module;
    }

    public reset() {
        this.controllerLoader = null!;
    }
}
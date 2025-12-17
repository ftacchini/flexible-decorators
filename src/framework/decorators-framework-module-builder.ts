import { ControllerLoader, PathControllerLoader } from "../controller";
import { DecoratorsFrameworkModule } from "./decorators-framework-module";

export class DecoratorsFrameworkModuleBuilder {

    private controllerLoader!: ControllerLoader;

    constructor() {
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
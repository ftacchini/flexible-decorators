import { FlexibleFrameworkModule } from "flexible-core";
import { AsyncContainerModule, Container, interfaces } from "inversify";
import { ControllerFactory, ControllerLoader } from "./controller";
import { DecoratorsFramework } from "./decorators-framework";
import { DECORATORS_FRAMEWORK_TYPES } from "./decorators-framework-types";

export class DecoratorsFrameworkModule implements FlexibleFrameworkModule {

    constructor(
        private controllerLoader: ControllerLoader
    ) {
    }

    public get isolatedContainer(): AsyncContainerModule {
        var module = new AsyncContainerModule(async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind) => {

            isBound(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK) || bind(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK).to(DecoratorsFramework);
            isBound(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER) || bind(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER).toConstantValue(this.controllerLoader);
            isBound(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY) || bind(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY).to(ControllerFactory);
        });

        return module;
    }

    public get container(): AsyncContainerModule {
        var module = new AsyncContainerModule(async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind) => {
        });

        return module;
    }

    public getInstance(container: Container): DecoratorsFramework {
        container.isBound(DECORATORS_FRAMEWORK_TYPES.CONTAINER) || container.bind(DECORATORS_FRAMEWORK_TYPES.CONTAINER).toConstantValue(container);
        return container.get(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK);
    }
}
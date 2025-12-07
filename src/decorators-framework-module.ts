import { FlexibleFrameworkModule } from "flexible-core";
import { ContainerModule, Container } from "inversify";
import { ControllerFactory, ControllerLoader } from "./controller";
import { DecoratorsFramework } from "./decorators-framework";
import { DECORATORS_FRAMEWORK_TYPES } from "./decorators-framework-types";
import { DecoratorsFrameworkModuleBuilder } from "./decorators-framework-module-builder";

export class DecoratorsFrameworkModule implements FlexibleFrameworkModule {

    /**
     * Creates a new builder for constructing DecoratorsFrameworkModule instances.
     * @returns A new DecoratorsFrameworkModuleBuilder instance
     */
    public static builder(): DecoratorsFrameworkModuleBuilder {
        return new DecoratorsFrameworkModuleBuilder();
    }

    constructor(
        private controllerLoader: ControllerLoader
    ) {
    }

    public get isolatedContainer(): ContainerModule {
        var module = new ContainerModule(({ bind, unbind, isBound, rebind }) => {
            isBound(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK) || bind(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK).to(DecoratorsFramework);
            isBound(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER) || bind(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER).toConstantValue(this.controllerLoader);
            isBound(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY) || bind(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY).to(ControllerFactory);
        });

        return module;
    }

    public get container(): ContainerModule {
        var module = new ContainerModule(({ bind, unbind, isBound, rebind }) => {
        });

        return module;
    }

    public getInstance(container: Container): DecoratorsFramework {
        container.isBound(DECORATORS_FRAMEWORK_TYPES.CONTAINER) || container.bind(DECORATORS_FRAMEWORK_TYPES.CONTAINER).toConstantValue(container);
        return container.get(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK);
    }
}
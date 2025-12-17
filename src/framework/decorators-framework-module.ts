import { FlexibleFrameworkModule, FlexibleContainer } from "flexible-core";
import { DependencyContainer } from "tsyringe";
import { ControllerFactory, ControllerLoader } from "../controller";
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

    public registerIsolated(container: DependencyContainer): void {
        if (!container.isRegistered(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK)) {
            container.register(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK, { useClass: DecoratorsFramework });
        }
        if (!container.isRegistered(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER)) {
            container.register(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER, { useValue: this.controllerLoader });
        }
        if (!container.isRegistered(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY)) {
            container.register(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY, { useClass: ControllerFactory });
        }

        // Debug: Log what tokens are available in this container
        console.log("[DEBUG] DecoratorsFrameworkModule isolated container setup complete");
    }

    public register(container: DependencyContainer): void {
        // No shared container bindings for decorators framework
    }

    public getInstance(container: FlexibleContainer): DecoratorsFramework {
        const tsyringeContainer = container.getContainer();
        if (!tsyringeContainer.isRegistered(DECORATORS_FRAMEWORK_TYPES.CONTAINER)) {
            tsyringeContainer.register(DECORATORS_FRAMEWORK_TYPES.CONTAINER, { useValue: tsyringeContainer });
        }
        return tsyringeContainer.resolve(DECORATORS_FRAMEWORK_TYPES.DECORATORS_FRAMEWORK);
    }
}
import { FlexibleFramework, FlexiblePipelineDocument, Type } from "flexible-core";
import { injectable, inject } from "inversify";
import { DECORATORS_FRAMEWORK_TYPES } from "./decorators-framework-types";
import { ControllerLoader } from "./controller-loader/controller-loader";
import { ControllerConfig } from "./decorators/controller-config";
import { flatten } from "lodash";

@injectable()
export class DecoratorsFramework implements FlexibleFramework {

    constructor(
        @inject(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER) private controllerLoader: ControllerLoader
        ) {

    }

    public async createPipelineDefinitions(): Promise<FlexiblePipelineDocument[]> {
        let controllerRecipes = await this.controllerLoader.loadControllers();

        return controllerRecipes.map(recipe => {
            return this.createPipelineDocument(recipe.target, recipe.config)
        })
    }

    private createPipelineDocument(target: Type<any>, config: ControllerConfig): FlexiblePipelineDocument {
        let activationContext = 
        return null;
    }

    
    private readRoutes(target: any) {
        var properties = Object.getOwnPropertyNames(target.prototype);

        var routeBuilders = flatten(properties.map(property => {
            return (this.metadataTags, target.prototype, property);
        }));

        return routeBuilders.filter(routeFactory => routeFactory)
                            .map(routeFactory => routeFactory(this.container))
                            .filter(route => route && route.supportsRouter(router));
    }
}
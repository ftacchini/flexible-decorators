import {
    FlexibleExtractor,
    FlexibleFilter,
    FlexibleFilterRecipe,
    FlexibleFramework,
    FlexibleMiddlewareDocument,
    FlexiblePipelineDocument,
    FlexibleRecipe,
    Type
} from "flexible-core";
import { injectable, inject } from "inversify";
import { DECORATORS_FRAMEWORK_TYPES } from "./decorators-framework-types";
import { ControllerLoader } from "./controller/controller-loader";
import { flatten } from "lodash";
import { CONTROLLER_KEY, EXTRACTOR_KEY, MIDDLEWARE_KEY, ROUTE_KEY } from "./decorators/decorator-keys";
import { ControllerDefinition } from "./decorators/controller";
import { MiddlewareDefinition } from "./decorators/middleware";
import { ActivationContextProvider } from "./activation-context-provider";
import { RouteDefinition } from "./decorators/route";
import { ExtractorDefinition } from "./decorators/parameter";
import { ControllerFactory } from "./controller";

@injectable()
export class DecoratorsFramework implements FlexibleFramework {

    constructor(
        @inject(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_LOADER) private controllerLoader: ControllerLoader,
        @inject(DECORATORS_FRAMEWORK_TYPES.CONTROLLER_FACTORY) private recipeFactory: ControllerFactory,

    ) {
    }

    public async createPipelineDefinitions(): Promise<FlexiblePipelineDocument[]> {
        let candidateControllers = await this.controllerLoader.loadControllers() || [];

        let controllers = candidateControllers.filter(candidateController => {
            return this.hasMetadata(CONTROLLER_KEY, candidateController);
        })

        let pipelineDocuments = flatten(controllers.map(controller => {
            let controllerDefinitions: ControllerDefinition<FlexibleFilter | undefined>[] = this.getMetadata(CONTROLLER_KEY, controller);

            return flatten(controllerDefinitions.map(controllerDefinition => {
                return this.createPipelineDocuments(controller, controllerDefinition);
            }));
        }));

        return pipelineDocuments;
    }

    private createPipelineDocuments(
        target: Type<any>,
        controllerDefinition: ControllerDefinition<FlexibleFilter | undefined>): FlexiblePipelineDocument[] {

        let candidateRoutes = Object.getOwnPropertyNames(target.prototype) || [];

        let routes = flatten(candidateRoutes.filter(candidateRoute => {
            return this.hasMetadata(ROUTE_KEY, target, candidateRoute);
        }));

        return routes.map(route => {
            return {
                middlewareStack: this.createMiddlewareStack(target, route, controllerDefinition),
                filterStack: this.createFilterStack(target, route, controllerDefinition)
            };
        });
    }

    private createMiddlewareStack(
        target: Type<any>,
        route: string,
        controllerDefinition: ControllerDefinition<FlexibleFilter>): FlexibleMiddlewareDocument[] {

        const [controllerBefore, controllerAfter] = this.createMiddlewareDocuments(target)
        const [routeBefore, routeAfter] = this.createMiddlewareDocuments(target, route);

        let routeMiddleware = {
            activationContext: ActivationContextProvider(
                target,
                {},
                route,
                controllerDefinition.singleton,
                this.recipeFactory
            ),
            extractorRecipes: this.createExtractorRecipes(target, route)
        };

        return [...controllerBefore, ...routeBefore, routeMiddleware, ...routeAfter, ...controllerAfter];
    }

    private createMiddlewareDocuments(target: Type<any>, property?: string): [FlexibleMiddlewareDocument[], FlexibleMiddlewareDocument[]] {
        if (!this.hasMetadata(MIDDLEWARE_KEY, target, property)) {
            return [[], []];
        }

        let middlewareDefinitions: MiddlewareDefinition<object>[] = this.getMetadata(MIDDLEWARE_KEY, target, property) || [];

        return middlewareDefinitions
            .map(middlewareDefinition => {

                let activationContext = ActivationContextProvider(
                    middlewareDefinition.middleware,
                    middlewareDefinition.config,
                    middlewareDefinition.method,
                    middlewareDefinition.singleton,
                    this.recipeFactory
                );

                let extractorRecipes = this.createExtractorRecipes(middlewareDefinition.middleware,  middlewareDefinition.method);

                return {
                    activationContext: activationContext,
                    extractorRecipes: extractorRecipes,
                    priority: middlewareDefinition.priority
                }
            })
            .sort(middlewareDefinition => middlewareDefinition.priority)
            .reduce((result, element) => {
                result[element.priority <= 0 ? 0 : 1].push(element); 
                return result;
            }, [[], []]);
    }

    private createFilterStack(
        target: Type<any>,
        route: string,
        controllerDefinition: ControllerDefinition<FlexibleFilter>): (FlexibleFilterRecipe<FlexibleFilter> | FlexibleFilterRecipe<FlexibleFilter>[])[] {

        let routeDefinitions: RouteDefinition<FlexibleFilter | undefined>[] = this.getMetadata(ROUTE_KEY, target, route) || [];
        let filterStack: (FlexibleFilterRecipe<FlexibleFilter> | FlexibleFilterRecipe<FlexibleFilter>[])[] = [];

        if (controllerDefinition.filter) {
            filterStack.push({
                configuration: controllerDefinition.configuration,
                type: controllerDefinition.filter
            });
        }

        filterStack.push(...routeDefinitions.map(routeDefinition => ({
            configuration: routeDefinition.configuration,
            type: routeDefinition.filter
        })));

        return filterStack;
    }

    private createExtractorRecipes(target: Type<any>, property: string): {
        [paramIndex: number]: FlexibleRecipe<FlexibleExtractor> | FlexibleRecipe<FlexibleExtractor>[];
    } {
        let extractorDefinitions: ExtractorDefinition<FlexibleExtractor>[] = this.getMetadata(EXTRACTOR_KEY, target, property) || [];

        let extractors:  {
            [paramIndex: number]: FlexibleRecipe<FlexibleExtractor> | FlexibleRecipe<FlexibleExtractor>[];
        } = {};

        extractorDefinitions.forEach(extractorDefinition => {
            extractors[extractorDefinition.index] = {
                configuration: extractorDefinition.configuration,
                type: extractorDefinition.extractor
            }
        })

        return extractors;
    }

    private hasMetadata(key: Symbol, target: any, property?: string) {
        return Reflect.getMetadata(key, property ? target.prototype : target, property);
    }

    private getMetadata(key: Symbol, target: any, property?: string): any {
        return Reflect.getMetadata(key, property ? target.prototype : target, property);
    }
}
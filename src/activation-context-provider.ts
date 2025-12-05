import { Type, FlexibleActivationContext } from "flexible-core";
import { ControllerFactory } from "./controller";

export function ActivationContextProvider<T extends object>(
    target: Type<T>,
    configuration: Partial<T>,
    method: keyof T,
    singleton: boolean,
    recipeFactory: ControllerFactory): FlexibleActivationContext {

    return {
        activate: function(
            _contextBinnacle: { [key: string]: any },
            ...params: any[]) {

            var middleware: T;

            if(singleton) {
                // Store singleton instance on activation context for reuse across requests
                middleware = this.controller || (this.controller = recipeFactory.createController({
                    configuration: configuration,
                    type: target
                }));
            }
            else {
                middleware = recipeFactory.createController({
                    configuration: configuration,
                    type: target
                })
            }

            return (<any>middleware[method])(...params);
        }
    }

}
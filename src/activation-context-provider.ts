import { Type, FlexibleActivationContext } from "flexible-core";
import { ControllerFactory } from "./controller";

export function ActivationContextProvider<T extends object>(
    target: Type<T>,
    configuration: Partial<T>,
    method: keyof T,
    singleton: boolean,
    recipeFactory: ControllerFactory): FlexibleActivationContext {

    return {
        activate: function(...params: any[]) {

            var middleware: T;
            
            if(singleton) {
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
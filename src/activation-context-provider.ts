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

            try {
            var middleware: T;
            console.log("creating")
            
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
        }
        catch(ex) {
            console.log("exception")
            console.log(ex);
            console.log(JSON.stringify(ex));
        }

            return (<any>middleware[method])(...params);
        }
    }

}
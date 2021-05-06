import { Type, FlexibleActivationContext } from "flexible-core";
import { ControllerFactory } from "./controller";

export function ActivationContextProvider<T extends object>(
    target: Type<T>,
    configuration: Partial<T>,
    method: keyof T,
    singleton: boolean,
    recipeFactory: ControllerFactory): FlexibleActivationContext {

    return {
        activate: (...params: any[]) => {

            var middleware: T = recipeFactory.createController({
                configuration: configuration,
                type: target
            }, singleton);

            return (<any>middleware[method])(...params);
        }
    }

}
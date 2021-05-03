import { Type, FlexibleRecipeFactory, FlexibleActivationContext } from "flexible-core";

export function ActivationContextProvider<T extends object>(
    target: Type<T>,
    configuration: Partial<T>,
    method: keyof T,
    singleton: boolean,
    recipeFactory: FlexibleRecipeFactory): FlexibleActivationContext {

    return {
        activate: (...params: any[]) => {

            var middleware: T;

            if (singleton) {
                middleware = this.controller || (this.controller = recipeFactory.craftRecipe({
                    configuration: configuration,
                    type: target
                }));
            }
            else {
                middleware = recipeFactory.craftRecipe({
                    configuration: configuration,
                    type: target
                })
            }

            return (<any>middleware[method]).apply(middleware, ...params);
        }
    }

}
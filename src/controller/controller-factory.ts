import { FlexibleRecipe } from "flexible-core";
import { injectable, inject, Container } from "inversify";
import { DECORATORS_FRAMEWORK_TYPES } from "../decorators-framework-types";

const RECIPE_HAS_NO_TYPE_ERROR = "A controller has no specified tpye and cannot be crafted";

@injectable()
export class ControllerFactory {

    constructor(
        @inject(DECORATORS_FRAMEWORK_TYPES.CONTAINER) private container: Container) {
    }

    public createController<recipeType extends object>(
        recipe: FlexibleRecipe<recipeType>,
        singleton: boolean): recipeType {
        
        if(!recipe || !recipe.type) {
            throw RECIPE_HAS_NO_TYPE_ERROR;
        }

        if(!this.container.isBound(recipe.type.name)) {
            const binding = this.container.bind(recipe.type.name).to(recipe.type);
            singleton && binding.inSingletonScope();
        }

        var instance = this.container.get<recipeType>(recipe.type.name);
    
        return Object.assign(instance, recipe.configuration || {});
    }

}
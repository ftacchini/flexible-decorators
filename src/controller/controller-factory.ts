import { FlexibleRecipe } from "flexible-core";
import { injectable, inject, DependencyContainer } from "tsyringe";
import { DECORATORS_FRAMEWORK_TYPES } from "../framework/decorators-framework-types";

const RECIPE_HAS_NO_TYPE_ERROR = "A controller has no specified type and cannot be crafted";

@injectable()
export class ControllerFactory {

    constructor(
        @inject(DECORATORS_FRAMEWORK_TYPES.CONTAINER) private container: DependencyContainer) {
    }

    public createController<recipeType extends object>(
        recipe: FlexibleRecipe<recipeType>): recipeType {

        if(!recipe || !recipe.type) {
            throw RECIPE_HAS_NO_TYPE_ERROR;
        }

        if(!this.container.isRegistered(recipe.type)) {
            this.container.register(recipe.type, { useClass: recipe.type });
        }

        var instance = this.container.resolve<recipeType>(recipe.type);

        return Object.assign(instance, recipe.configuration || {});
    }

}
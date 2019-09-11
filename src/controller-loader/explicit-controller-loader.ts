import { ControllerRecipe } from "./controller-recipe";

export class ExplicitControllerLoader {

    constructor(private controllerRecipes: ControllerRecipe[]) {
    }

    public async loadControllers(): Promise<ControllerRecipe[]>{
        return this.controllerRecipes;
    }

}
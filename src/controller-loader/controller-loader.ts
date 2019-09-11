import { ControllerRecipe } from "./controller-recipe";

export interface ControllerLoader {
    loadControllers() : Promise<ControllerRecipe[]>;
}
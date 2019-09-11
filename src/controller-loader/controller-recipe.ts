import { ControllerConfig } from "../decorators/controller-config";
import { Type } from "flexible-core";

export interface ControllerRecipe {
    config: ControllerConfig;
    target: Type<any>;
}
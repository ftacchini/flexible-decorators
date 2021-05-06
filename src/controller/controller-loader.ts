import { Type } from "flexible-core";

export interface ControllerLoader {
    loadControllers() : Promise<Type<object>[]>;
}
import { Type } from "flexible-core";
import { Middleware } from "./middleware";

export const BeforeExecution = function attributeDefinition<T extends object>(
    middleware: Type<T>,
    method: keyof T,
    singleton: boolean = false,
    config: Partial<T> = {}) {
        return Middleware(middleware, method, singleton, -1, config);
}
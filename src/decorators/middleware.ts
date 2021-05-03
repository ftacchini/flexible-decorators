import { MIDDLEWARE_KEY } from "./decorator-keys";
import { Type } from "flexible-core";

export const Middleware = function attributeDefinition<T extends object>(
    middleware: Type<T>,
    method: keyof T,
    singleton: boolean = false,
    priority: number = 0,
    config: Partial<T> = {}) {

    return (target: any, property?: any) => {
        if (!Reflect.hasMetadata(MIDDLEWARE_KEY, target, property)) {
            Reflect.defineMetadata(MIDDLEWARE_KEY, [], target, property);
        }

        var middlewareConfigs: MiddlewareDefinition<T>[] = Reflect.getMetadata(MIDDLEWARE_KEY, target, property);
        middlewareConfigs.push({ 
            middleware: middleware, 
            method: method, 
            priority: priority, 
            singleton: singleton,
            config: config 
        });
    }
}


export interface MiddlewareDefinition<T extends object> {
    readonly middleware: Type<T>,
    readonly method: keyof T;
    readonly singleton: boolean;
    readonly priority: number;
    readonly config: Partial<T>;
}
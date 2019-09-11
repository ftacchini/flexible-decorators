import { ROUTE_KEY } from "./decorator-keys";
import { FlexibleFilter, Type } from "flexible-core";

export const Route = function attributeDefinition<T extends FlexibleFilter>(
    filter: Type<T>,
    configuration?: Partial<T>) {

    return (target: any, something?: any) => {
        if (!Reflect.hasMetadata(ROUTE_KEY, target)) {
            Reflect.defineMetadata(ROUTE_KEY, [], target);
        }

        var controllers = Reflect.getMetadata(ROUTE_KEY, target);
        controllers.push(configuration);
    }
}
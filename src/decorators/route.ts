import { ROUTE_KEY } from "./decorator-keys";
import { FlexibleFilter, Type, FilterConfiguration, FlexibleFilterRecipe } from "flexible-core";

export const Route = function attributeDefinition<T extends (FlexibleFilter | undefined)>(
    filter?: Type<T>,
    configuration?: FilterConfiguration<T>) {

    return (target: any, property: any) => {
        if (!Reflect.hasMetadata(ROUTE_KEY, target, property)) {
            Reflect.defineMetadata(ROUTE_KEY, [], target, property);
        }

        var routes: FlexibleFilterRecipe<T>[] = Reflect.getMetadata(ROUTE_KEY, target, property);
        routes.push({ 
            type: filter, 
            configuration: configuration});
    }
}


export interface RouteDefinition<T extends (FlexibleFilter | undefined)> {
    readonly filter?: Type<T>,
    readonly configuration?: FilterConfiguration<T>;
}
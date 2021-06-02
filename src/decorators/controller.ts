import { injectable } from 'inversify';
import { CONTROLLER_KEY } from "./decorator-keys";
import { FlexibleFilter, Type, FilterConfiguration } from 'flexible-core';

export const Controller = function attributeDefinition<T extends (FlexibleFilter | undefined)>(
    { singleton = false, filter, configuration } : { 
        singleton?: boolean,
        filter?: Type<T>,
        configuration?: FilterConfiguration<T> 
    } = {}) {

    return (target: any) => {
        injectable()(target);

        if (!Reflect.hasMetadata(CONTROLLER_KEY, target)) {
            Reflect.defineMetadata(CONTROLLER_KEY, [], target);
        }

        if(filter && (!configuration || !configuration.contextName)) {
            configuration || (configuration = {});
            configuration.contextName = target.name.replace("Controller", "");
        }

        var controllers: ControllerDefinition<T>[] = Reflect.getMetadata(CONTROLLER_KEY, target);
        controllers.push({ singleton: singleton, filter: filter, configuration: configuration });
    }
}

export interface ControllerDefinition<T extends (FlexibleFilter | undefined)> {
    readonly singleton: boolean;
    readonly filter?: Type<T>,
    readonly configuration?: FilterConfiguration<T>;
}
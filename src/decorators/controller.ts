import { injectable } from 'inversify';
import { CONTROLLER_KEY } from "./decorator-keys";
import { ControllerConfig } from './controller-config';

export const Controller = function attributeDefinition(
    configuration?: ControllerConfig) {

    return (target: any) => {
        injectable()(target);

        if (!Reflect.hasMetadata(CONTROLLER_KEYS, target)) {
            Reflect.defineMetadata(CONTROLLER_KEYS, [], target);
        }

        var controllers = Reflect.getMetadata(CONTROLLER_KEYS, target);
        controllers.push(configuration);
    }
}
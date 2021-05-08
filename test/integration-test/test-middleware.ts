import { EventType } from "flexible-core";
import { Param } from "../../src";
import { injectable } from "inversify";

@injectable()
export class TestMiddleware {

    public configValue: any;

    public execMiddleware(@Param(EventType) eventType: any) {
        return {
            configValue: this.configValue,
            eventType: eventType
        }
    }
}
import { FlexibleFilter, Type } from "flexible-core";

export interface ControllerConfig {
    singleton: boolean;
    filter: Type<FlexibleFilter>;
}
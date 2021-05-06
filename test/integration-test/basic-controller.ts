import { EventData, IfEventIs } from "flexible-core";
import { Controller, Param, Route } from "../../src";

@Controller(false)
export class BasicController {

    @Route(IfEventIs, { eventType: "dummy" })
    public route(@Param(EventData) data: any) {
        return data;
    }
}
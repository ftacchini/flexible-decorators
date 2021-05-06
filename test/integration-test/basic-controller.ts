import { EventData, IfEventIs } from "flexible-core";
import { Controller, Param, Route } from "../../src";

@Controller(false)
export class BasicController {

    private call: number = 0;

    @Route(IfEventIs, { eventType: "basic" })
    public route(@Param(EventData) data: any) {
        data.callNumber = ++this.call;
        return data;
    }
}

@Controller(true)
export class SingletonController {
    
    private call: number = 0;

    @Route(IfEventIs, { eventType: "singleton" })
    public route(@Param(EventData) data: any) {
        data.callNumber = ++this.call;
        return data;
    }
}
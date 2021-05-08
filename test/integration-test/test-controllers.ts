import { EventData, IfEventIs } from "flexible-core";
import { BeforeExecution, Controller, Param, Route } from "../../src";
import { TestMiddleware } from "./test-middleware";

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

@Controller(false)
export class MiddlewareController {
    
    @BeforeExecution(
        TestMiddleware, 
        "execMiddleware", 
        false, 
        { configValue: "configValue" })
    @Route(IfEventIs, { eventType: "middleware" })
    public route(@Param(EventData) data: any) {
        return data;
    }
}
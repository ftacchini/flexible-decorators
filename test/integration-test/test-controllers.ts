import { EventData, IfEventIs } from "flexible-core";
import { AfterExecution, BeforeExecution, Controller, Param, Route } from "../../src";
import { TestMiddleware } from "./test-middleware";

@Controller()
export class BasicController {

    private call: number = 0;

    @Route(IfEventIs, { eventType: "basic" })
    public route(@Param(EventData) data: any) {
        data.callNumber = ++this.call;
        return data;
    }
}

@Controller({ singleton: true })
export class SingletonController {

    private call: number = 0;

    @Route(IfEventIs, { eventType: "singleton" })
    public route(@Param(EventData) data: any) {
        data.callNumber = ++this.call;
        return data;
    }
}

@Controller()
export class RouteMiddlewareController {

    @BeforeExecution(
        TestMiddleware,
        "execMiddleware",
        { singleton: false, config: { configValue: "configValue" } })
    @Route(IfEventIs, { eventType: "middlewareBefore" })
    public routeBefore(@Param(EventData) data: any) {
        return data;
    }

    @AfterExecution(
        TestMiddleware,
        "execMiddleware",
        { singleton: false, config: { configValue: "configValue" } })
    @Route(IfEventIs, { eventType: "middlewareAfter" })
    public routeAfter(@Param(EventData) data: any) {
        return data;
    }
}

@Controller({ filter: IfEventIs, configuration: { eventType: "stackMiddleware" } })
@BeforeExecution(TestMiddleware, "execMiddleware", { singleton: false, config: { configValue: "1" } })
@AfterExecution(TestMiddleware, "execMiddleware", { singleton: false, config: { configValue: "4" } })
export class StackMiddlewareController {

    @BeforeExecution(TestMiddleware, "execMiddleware", { singleton: false, config: { configValue: "2" } })
    @AfterExecution(TestMiddleware, "execMiddleware", { singleton: false, config: { configValue: "3" } })
    @Route(IfEventIs, { eventType: "stackMiddleware" })
    public routeBefore(@Param(EventData) data: any) {
        return data;
    }
}
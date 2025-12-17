import "reflect-metadata";
import "jasmine";
import { FlexibleApp, DummyEventSource, FlexibleEvent, IfEventIs, FullEvent, CancellationError } from "flexible-core";
import { DecoratorsFrameworkModule, ExplicitControllerLoader, Controller, Route, BeforeExecution, Param, CancellationMiddleware } from "../../../src";

describe("CancellationMiddleware Integration", () => {

    @Controller()
    class TestController {
        @BeforeExecution(CancellationMiddleware, 'processEvent', { singleton: true })
        @Route(IfEventIs, { eventType: "test" })
        public async handleRequest(@Param(FullEvent) event: FlexibleEvent) {
            return { success: true };
        }
    }

    it("should allow requests without cancellation token", async () => {
        const eventSource = new DummyEventSource();

        const framework = DecoratorsFrameworkModule.builder()
            .withControllerLoader(new ExplicitControllerLoader([TestController]))
            .build();

        const app = FlexibleApp.builder()
            .addEventSource({
                getInstance: () => eventSource,
                register: () => {},
                registerIsolated: () => {}
            })
            .addFramework(framework)
            .createApp();

        await app.run();

        const event: FlexibleEvent = {
            eventType: "test",
            data: {},
            routeData: {}
        };

        const result = await eventSource.generateEvent(event);

        expect(result[0].errorStack.length).toBe(0);
        expect(result[0].responseStack.length).toBe(2);
        // First response is from middleware (null), second is from controller
        expect(result[0].responseStack[1].success).toBe(true);
    });

    it("should throw CancellationError for aborted tokens", async () => {
        const eventSource = new DummyEventSource();

        const framework = DecoratorsFrameworkModule.builder()
            .withControllerLoader(new ExplicitControllerLoader([TestController]))
            .build();

        const app = FlexibleApp.builder()
            .addEventSource({
                getInstance: () => eventSource,
                register: () => {},
                registerIsolated: () => {}
            })
            .addFramework(framework)
            .createApp();

        await app.run();

        const abortController = new AbortController();
        abortController.abort();

        const event: any = {
            eventType: "test",
            data: {},
            routeData: {},
            cancellationToken: abortController.signal
        };

        const result = await eventSource.generateEvent(event);

        expect(result[0].errorStack.length).toBe(1);
        expect(result[0].errorStack[0]).toBeInstanceOf(CancellationError);
    });
});

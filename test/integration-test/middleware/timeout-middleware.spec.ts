import "reflect-metadata";
import "jasmine";
import { FlexibleApp, DummyEventSource, FlexibleEvent, IfEventIs, FullEvent, TimeoutError } from "flexible-core";
import { DecoratorsFrameworkModule, ExplicitControllerLoader, Controller, Route, BeforeExecution, Param, TimeoutMiddleware } from "../../../src";

describe("TimeoutMiddleware Integration", () => {

    class SlowMiddleware {
        public async doSomethingSlow() {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    @Controller()
    class TestController {
        @BeforeExecution(TimeoutMiddleware, 'processEvent', {
            singleton: true,
            config: { config: { timeout: 100 } }
        })
        @Route(IfEventIs, { eventType: "fast" })
        public async fastRequest(@Param(FullEvent) event: FlexibleEvent) {
            await new Promise(resolve => setTimeout(resolve, 10));
            return { success: true };
        }

        @BeforeExecution(SlowMiddleware, 'doSomethingSlow', { singleton: false })
        @BeforeExecution(TimeoutMiddleware, 'processEvent', {
            singleton: false,
            config: { config: { timeout: 50 } }
        })
        @Route(IfEventIs, { eventType: "slow" })
        public async slowRequest(@Param(FullEvent) event: FlexibleEvent) {
            // Timeout check happens before this method
            // SlowMiddleware took 200ms, so timeout should have been triggered
            return { success: true };
        }
    }

    @Controller()
    class AnotherController {
        // This ensures there's another middleware after the slow one
        @Route(IfEventIs, { eventType: "dummy" })
        public async dummy() {
            return {};
        }
    }

    it("should allow fast requests to complete", async () => {
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
            eventType: "fast",
            data: {},
            routeData: {}
        };

        const result = await eventSource.generateEvent(event);

        expect(result[0].errorStack.length).toBe(0);
        expect(result[0].responseStack.length).toBe(2);
        // First response is from middleware (null), second is from controller
        expect(result[0].responseStack[1].success).toBe(true);
    });

    it("should timeout slow requests", async () => {
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
            eventType: "slow",
            data: {},
            routeData: {}
        };

        const result = await eventSource.generateEvent(event);

        expect(result[0].errorStack.length).toBe(1);
        expect(result[0].errorStack[0]).toBeInstanceOf(TimeoutError);
        expect((result[0].errorStack[0] as TimeoutError).timeout).toBe(50);
    });
});

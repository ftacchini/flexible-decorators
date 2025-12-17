import "reflect-metadata";
import "jasmine";
import { FlexibleApp, DummyEventSource, FlexibleEvent, IfEventIs, FullEvent, RateLimitConfig, SecurityError, RATE_LIMIT_TYPES, MemoryRateLimitStore, FlexibleContainer } from "flexible-core";
import { DecoratorsFrameworkModule, ExplicitControllerLoader, Controller, Route, BeforeExecution, Param, RateLimitMiddleware } from "../../../src";

describe("RateLimitMiddleware Integration", () => {

    @Controller()
    class TestController {
        @BeforeExecution(RateLimitMiddleware, 'check', {
            singleton: true,
            config: { config: new RateLimitConfig({ max: 2, windowMs: 60000 }) }
        })
        @Route(IfEventIs, { eventType: "test" })
        public async handleRequest(@Param(FullEvent) event: FlexibleEvent) {
            return { success: true };
        }
    }

    it("should allow requests within rate limit", async () => {
        const eventSource = new DummyEventSource();
        const container = new FlexibleContainer();
        const store = new MemoryRateLimitStore();
        container.registerValue(RATE_LIMIT_TYPES.STORE, store);

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
            .withContainer(container)
            .createApp();

        await app.run();

        const event: any = {
            eventType: "test",
            data: {},
            routeData: {},
            sourceIp: "192.168.1.1"
        };

        // First request should succeed
        const result1 = await eventSource.generateEvent(event);
        expect(result1[0].errorStack.length).toBe(0);

        // Second request should succeed
        const result2 = await eventSource.generateEvent(event);
        expect(result2[0].errorStack.length).toBe(0);

        store.destroy();
    });

    it("should reject requests exceeding rate limit", async () => {
        const eventSource = new DummyEventSource();
        const container = new FlexibleContainer();
        const store = new MemoryRateLimitStore();
        container.registerValue(RATE_LIMIT_TYPES.STORE, store);

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
            .withContainer(container)
            .createApp();

        await app.run();

        const event: any = {
            eventType: "test",
            data: {},
            routeData: {},
            sourceIp: "192.168.1.1"
        };

        // First two requests should succeed
        await eventSource.generateEvent(event);
        await eventSource.generateEvent(event);

        // Third request should be rate limited
        const result3 = await eventSource.generateEvent(event);
        expect(result3[0].errorStack.length).toBe(1);
        expect(result3[0].errorStack[0]).toBeInstanceOf(SecurityError);
        expect((result3[0].errorStack[0] as SecurityError).statusCode).toBe(429);

        store.destroy();
    });
});

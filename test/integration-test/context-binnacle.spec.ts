import "reflect-metadata";
import "jasmine";
import { FlexibleApp } from "flexible-core";
import { DummyEventSource } from "flexible-core";
import { FlexibleEvent, IfEventIs, ContextBinnacle } from "flexible-core";
import { DecoratorsFrameworkModule, ExplicitControllerLoader, Controller, Route, Param } from "../../src";

describe("ContextBinnacle Extractor", () => {

    @Controller()
    class TestController {
        @Route(IfEventIs, { eventType: "test" })
        public async handleRequest(
            @Param(ContextBinnacle) contextBinnacle: { [key: string]: any }
        ) {
            // Store something in the binnacle
            contextBinnacle.testValue = "stored";
            return { success: true, hadBinnacle: !!contextBinnacle };
        }
    }

    it("should extract contextBinnacle and make it available to controller methods", async () => {
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

        expect(result[0].responseStack.length).toBe(1);
        expect(result[0].responseStack[0].success).toBe(true);
        expect(result[0].responseStack[0].hadBinnacle).toBe(true);
    });
});

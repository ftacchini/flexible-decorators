import "reflect-metadata";
import "jasmine";
import {
    FlexibleApp,
    FlexibleEventSourceModule,
    FlexibleAppBuilder
} from "flexible-core";
import { DummyEventSource } from "flexible-dummy-source";
import { AsyncContainerModule } from "inversify";
import { DecoratorsFrameworkModuleBuilder } from "../../src/decorators-framework-module-builder"
import { ExplicitControllerLoader } from "../../src";
import { BasicController, MiddlewareController, SingletonController } from "./test-controllers";

describe(`DecoratedApp`, () => {

    let app: FlexibleApp;
    let eventSource: DummyEventSource;

    beforeEach(async (done) => {
        eventSource = new DummyEventSource();

        let eventSourceModule: FlexibleEventSourceModule = {
            getInstance: () => eventSource,
            container: new AsyncContainerModule(async () => { }),
            isolatedContainer: new AsyncContainerModule(async () => { })
        };

        let frameworkModule = DecoratorsFrameworkModuleBuilder.instance
            .withControllerLoader(new ExplicitControllerLoader([
                BasicController,
                SingletonController,
                MiddlewareController
            ]))
            .build();

        app = FlexibleAppBuilder.instance
            .addEventSource(eventSourceModule)
            .addFramework(frameworkModule)
            .createApp();

        done();
    })

    it("should start correctly", async (done) => {
        //ARRANGE
        //ACT
        const result = await app.run();

        //ASSERT
        expect(result[0]).toEqual(true)
        done();
    })

    it("should respond to route request with response", async (done) => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "basic",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0]).toBe(data);
        done();
    })
    
    it("should respond to route request outside of singleton scope", async (done) => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        await eventSource.generateEvent({
            data: data,
            eventType: "basic",
            routeData: routeData
        });

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "basic",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0].callNumber).toBe(1);
        done();
    })

    it("should respond to route request in singleton scope", async (done) => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        await eventSource.generateEvent({
            data: data,
            eventType: "singleton",
            routeData: routeData
        });

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "singleton",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0].callNumber).toBe(2);
        done();
    })

    it("should execute middleware before method", async (done) => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "middleware",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0]).toEqual({
            configValue: "configValue",
            eventType: "middleware"
        });
        expect(response[0].responseStack[1]).toEqual(data);
        done();
    })

});
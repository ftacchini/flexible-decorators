import "reflect-metadata";
import "jasmine";
import {
    FlexibleApp,
    FlexibleEventSourceModule,
    FlexibleAppBuilder,
    FlexibleModule,
    SilentLoggerModule,
    DummyEventSource
} from "flexible-core";
import { AsyncContainerModule, interfaces, Container } from "inversify";
import { DecoratorsFrameworkModuleBuilder } from "../../src/decorators-framework-module-builder"
import { ExplicitControllerLoader } from "../../src";
import {
    BasicController,
    RouteMiddlewareController,
    SingletonController,
    StackMiddlewareController,
    WithDependenciesController} from "./test-controllers";
import { D1, D2 } from "./dependency-keys";

describe(`DecoratedApp`, () => {

    let app: FlexibleApp;
    let eventSource: DummyEventSource;
    let container: Container;

    beforeEach(async () => {
        eventSource = new DummyEventSource();

        container = new Container();

        let dependenciesModule: FlexibleModule = {
            container: new AsyncContainerModule(async (
                bind: interfaces.Bind,
                unbind: interfaces.Unbind,
                isBound: interfaces.IsBound,
                rebind: interfaces.Rebind) => {
                    bind(D1).toConstantValue(D1.toString());
                    bind(D2).toConstantValue(D2.toString());
            })
        };

        let eventSourceModule: FlexibleEventSourceModule = {
            getInstance: () => eventSource,
            container: new AsyncContainerModule(async (
                bind: interfaces.Bind) => {

                 }),
            isolatedContainer: new AsyncContainerModule(async () => { })
        };

        let frameworkModule = DecoratorsFrameworkModuleBuilder.instance
            .withControllerLoader(new ExplicitControllerLoader([
                BasicController,
                SingletonController,
                RouteMiddlewareController,
                StackMiddlewareController,
                WithDependenciesController
            ]))
            .build();

        app = FlexibleAppBuilder.instance
            .withLogger(new SilentLoggerModule())
            .addModule(dependenciesModule)
            .addEventSource(eventSourceModule)
            .addFramework(frameworkModule)
            .withContainer(container)
            .createApp();


    })

    it("should start correctly", async () => {
        //ARRANGE
        //ACT
        const result = await app.run();

        //ASSERT
        expect(result[0]).toEqual(true)

    })

    it("should respond to route request with response", async () => {
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

    })

    it("should respond to route request outside of singleton scope", async () => {
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

    })

    it("should respond to route request in singleton scope", async () => {
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

    })

    it("should execute middleware before method", async () => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "middlewareBefore",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0]).toEqual({
            configValue: "configValue",
            eventType: "middlewareBefore"
        });
        expect(response[0].responseStack[1]).toEqual(data);

    })

    it("should execute middleware after method", async () => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "middlewareAfter",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0]).toEqual(data);
        expect(response[0].responseStack[1]).toEqual({
            configValue: "configValue",
            eventType: "middlewareAfter"
        });

    })

    it("should execute middleware stack", async () => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "stackMiddleware",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0]).toEqual({
            configValue: "1",
            eventType: "stackMiddleware"
        });
        expect(response[0].responseStack[1]).toEqual({
            configValue: "2",
            eventType: "stackMiddleware"
        });

        expect(response[0].responseStack[2]).toEqual(data);

        expect(response[0].responseStack[3]).toEqual({
            configValue: "3",
            eventType: "stackMiddleware"
        });
        expect(response[0].responseStack[4]).toEqual({
            configValue: "4",
            eventType: "stackMiddleware"
        });

    })

    it("should instanciate controller with dependencies correctly", async () => {
        //ARRANGE
        const data = { data: "data" };
        const routeData = { routeData: "routeData" };

        //ACT
        await app.run();

        const response = await eventSource.generateEvent({
            data: data,
            eventType: "withDependencies",
            routeData: routeData
        });

        //ASSERT
        expect(response[0].responseStack[0]).toBe(`${D1.toString()}#${D2.toString()}`);

    })

});
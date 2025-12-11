import "reflect-metadata";
import "jasmine";
import { injectable, inject, injectAll, container } from "tsyringe";
import { Controller } from "../../src/decorators/controller";
import { CONTROLLER_KEY } from "../../src/decorators/decorator-keys";

describe("Decorators", () => {

    describe("@injectable decorator", () => {
        it("should mark class as injectable", () => {
            // ARRANGE & ACT
            @injectable()
            class TestClass {
                constructor() {}
            }

            // ASSERT
            // TSyringe's @injectable decorator should work without throwing
            expect(() => new TestClass()).not.toThrow();
        });

        it("should work with dependency injection container", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();

            @injectable()
            class TestService {
                getValue() { return "test-value"; }
            }

            // ACT
            testContainer.register("TestService", { useClass: TestService });
            const instance = testContainer.resolve<TestService>("TestService");

            // ASSERT
            expect(instance).toBeInstanceOf(TestService);
            expect(instance.getValue()).toBe("test-value");
        });
    });

    describe("@inject decorator", () => {
        it("should inject dependencies correctly", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();
            const testToken = "TestDependency";
            const testValue = "injected-value";

            @injectable()
            class TestClass {
                constructor(@inject(testToken) public dependency: string) {}
            }

            // ACT
            testContainer.register(testToken, { useValue: testValue });
            testContainer.register("TestClass", { useClass: TestClass });
            const instance = testContainer.resolve<TestClass>("TestClass");

            // ASSERT
            expect(instance.dependency).toBe(testValue);
        });

        it("should work with symbol tokens", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();
            const testSymbol = Symbol("TestSymbol");
            const testValue = "symbol-injected-value";

            @injectable()
            class TestClass {
                constructor(@inject(testSymbol) public dependency: string) {}
            }

            // ACT
            testContainer.register(testSymbol, { useValue: testValue });
            testContainer.register("TestClass", { useClass: TestClass });
            const instance = testContainer.resolve<TestClass>("TestClass");

            // ASSERT
            expect(instance.dependency).toBe(testValue);
        });
    });

    describe("@injectAll decorator", () => {
        it("should inject all registered instances of a token", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();
            const testToken = "MultipleServices";

            interface IService {
                getName(): string;
            }

            @injectable()
            class ServiceA implements IService {
                getName() { return "ServiceA"; }
            }

            @injectable()
            class ServiceB implements IService {
                getName() { return "ServiceB"; }
            }

            @injectable()
            class TestClass {
                constructor(@injectAll(testToken) public services: IService[]) {}
            }

            // ACT
            testContainer.register(testToken, { useClass: ServiceA });
            testContainer.register(testToken, { useClass: ServiceB });
            testContainer.register("TestClass", { useClass: TestClass });
            const instance = testContainer.resolve<TestClass>("TestClass");

            // ASSERT
            expect(instance.services).toBeInstanceOf(Array);
            expect(instance.services.length).toBe(2);
            expect(instance.services.map((s: IService) => s.getName()).sort()).toEqual(["ServiceA", "ServiceB"]);
        });
    });

    describe("Controller decorator integration", () => {
        it("should work with @injectable from TSyringe", () => {
            // ARRANGE & ACT
            @Controller()
            class TestController {
                testMethod() { return "test"; }
            }

            // ASSERT
            // Should have controller metadata
            expect(Reflect.hasMetadata(CONTROLLER_KEY, TestController)).toBe(true);

            // Should be injectable (no error when creating instance)
            expect(() => new TestController()).not.toThrow();
        });

        it("should work with dependency injection", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();
            const testToken = "TestDependency";
            const testValue = "controller-dependency";

            @Controller()
            class TestController {
                constructor(@inject(testToken) public dependency: string) {}

                getDependency() { return this.dependency; }
            }

            // ACT
            testContainer.register(testToken, { useValue: testValue });
            testContainer.register("TestController", { useClass: TestController });
            const instance = testContainer.resolve<TestController>("TestController");

            // ASSERT
            expect(instance.getDependency()).toBe(testValue);
        });

        it("should register controller with singleton configuration", () => {
            // ARRANGE & ACT
            @Controller({ singleton: true })
            class SingletonTestController {
                testMethod() { return "singleton-test"; }
            }

            // ASSERT
            const controllerMetadata = Reflect.getMetadata(CONTROLLER_KEY, SingletonTestController);
            expect(controllerMetadata).toBeDefined();
            expect(controllerMetadata[0].singleton).toBe(true);
        });

        it("should register controller with filter configuration", () => {
            // ARRANGE
            class TestFilter {
                staticRouting = { route: "test-route" };
                isLastFilter = false;
                contextName = "TestFilter";

                async filterEvent() {
                    return Promise.resolve(true);
                }
            }

            // ACT
            @Controller({ filter: TestFilter, configuration: { contextName: "TestContext" } })
            class FilteredTestController {
                testMethod() { return "filtered-test"; }
            }

            // ASSERT
            const controllerMetadata = Reflect.getMetadata(CONTROLLER_KEY, FilteredTestController);
            expect(controllerMetadata).toBeDefined();
            expect(controllerMetadata[0].filter).toBe(TestFilter);
            expect(controllerMetadata[0].configuration.contextName).toBe("TestContext");
        });

        it("should support multiple dependencies injection", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();
            const token1 = "Dependency1";
            const token2 = "Dependency2";
            const value1 = "first-dependency";
            const value2 = "second-dependency";

            @Controller()
            class MultiDependencyController {
                constructor(
                    @inject(token1) public dep1: string,
                    @inject(token2) public dep2: string
                ) {}

                getCombinedDependencies() {
                    return `${this.dep1}-${this.dep2}`;
                }
            }

            // ACT
            testContainer.register(token1, { useValue: value1 });
            testContainer.register(token2, { useValue: value2 });
            testContainer.register("MultiDependencyController", { useClass: MultiDependencyController });
            const instance = testContainer.resolve<MultiDependencyController>("MultiDependencyController");

            // ASSERT
            expect(instance.getCombinedDependencies()).toBe("first-dependency-second-dependency");
        });

        it("should work with class-based dependency injection", () => {
            // ARRANGE
            const testContainer = container.createChildContainer();

            @injectable()
            class TestService {
                getValue() { return "service-value"; }
            }

            @Controller()
            class ServiceDependentController {
                constructor(@inject("TestService") public service: TestService) {}

                getServiceValue() {
                    return this.service.getValue();
                }
            }

            // ACT
            testContainer.register("TestService", { useClass: TestService });
            testContainer.register("ServiceDependentController", { useClass: ServiceDependentController });
            const instance = testContainer.resolve<ServiceDependentController>("ServiceDependentController");

            // ASSERT
            expect(instance.getServiceValue()).toBe("service-value");
        });

        it("should preserve controller metadata when using TSyringe decorators", () => {
            // ARRANGE & ACT
            @Controller({ singleton: true })
            class MetadataTestController {
                constructor(@inject("TestToken") public dependency: string) {}

                testMethod() { return "metadata-test"; }
            }

            // ASSERT
            const controllerMetadata = Reflect.getMetadata(CONTROLLER_KEY, MetadataTestController);
            expect(controllerMetadata).toBeDefined();
            expect(controllerMetadata.length).toBe(1);
            expect(controllerMetadata[0].singleton).toBe(true);
        });
    });
});
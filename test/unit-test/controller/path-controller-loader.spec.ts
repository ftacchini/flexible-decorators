import "reflect-metadata";
import "jasmine";
import { PathControllerLoader } from "../../../src";

describe("PathControllerLoader", () => {


    describe("loadControllers", () => {

        it("should load controllers from default pattern files", async () => {
            //ARRANGE
            const pathControllerLoader = new PathControllerLoader();

            //ACT
            const controllers = await pathControllerLoader.loadControllers();

            //ASSERT
            expect(controllers.map(c => c.name)).toEqual([
                "MultipleController",
                "MultipleController1",
                "PatternController"
            ])
        })

        it("should load controllers from custom pattern files", async () => {
            //ARRANGE
            const pathControllerLoader = new PathControllerLoader(
                "",
                /(.+\-handler)\.js$/);

            //ACT
            const controllers = await pathControllerLoader.loadControllers();

            //ASSERT
            expect(controllers.map(c => c.name)).toEqual([
                "OtherPatternController"
            ])
        })
    })
})
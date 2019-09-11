import "reflect-metadata"
import { ControllerLoader } from "./controller-loader";
import { flatten, union, map, filter, each, values } from "lodash";
import { CONTROLLER_KEY } from "../decorators/decorator-keys";
import { ControllerConfig } from "../decorators/controller-config";
import { ControllerRecipe } from "./controller-recipe";

const includeAll = require("include-all");
const path = require("path");

export class PathControllerLoader implements ControllerLoader {
    
    constructor(
        private baseDir?: string,
        private filePattern?: RegExp,
        private ignorePattern?: RegExp){
        
        }

    public async loadControllers() : Promise<ControllerRecipe[]> {
        
        let controllerFiles = includeAll(<any>{
            dirname: path.join(process.cwd(), this.baseDir || ""),
            filter: this.filePattern || /(.+)\-controller\.js$/,
            excludeDirs: this.ignorePattern || /^\.(git|svn|node_modules)$/,
            flatten: true
        });

        let controllers: any[] = [];
        
        each(values(controllerFiles), (exportedData: any) => {

            let controllerRecipesArrays =  map<any, any[]>(exportedData, (value: any) => {
                let metadata = Reflect.getMetadata(CONTROLLER_KEY, value);
                return metadata && metadata.length && metadata.map((config: ControllerConfig) => { 
                    return { config: config, target: value }
                });
            });

            let dirtyControllersRecipes = flatten(controllerRecipesArrays); 
            let controllerRecipes = filter(dirtyControllersRecipes, value => value);
            
            controllers = union(controllers, controllerRecipes);
        });
        
        return controllers;
    }
}
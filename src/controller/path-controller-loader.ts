import { ControllerLoader } from "./controller-loader";
import { flatten, union, filter, each, values } from "lodash";
import { Type } from "flexible-core";
import { injectable } from "inversify";

const includeAll = require("include-all");
const path = require("path");

@injectable()
export class PathControllerLoader implements ControllerLoader {
    
    constructor(
        private baseDir?: string,
        private filePattern?: RegExp,
        private ignorePattern?: RegExp){
        
        }

    public async loadControllers() : Promise<Type<object>[]> {
        
        let controllerFiles = includeAll(<any>{
            dirname: path.join(process.cwd(), this.baseDir || ""),
            filter: this.filePattern || /(.+)\-controller\.js$/,
            excludeDirs: this.ignorePattern || /^\.(git|svn|node_modules)$/,
            flatten: true
        });

        let candidateControllers: any[] = [];
        
        each(values(controllerFiles), (exportedData: any) => {
            candidateControllers = union(candidateControllers, filter(flatten(exportedData), value => value));
        });
        
        return candidateControllers;
    }
}
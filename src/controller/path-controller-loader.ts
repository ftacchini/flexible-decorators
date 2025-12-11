import { ControllerLoader } from "./controller-loader";
import { flatten, map, values } from "lodash";
import { Type } from "flexible-core";
import { injectable } from "tsyringe";

const includeAll = require("include-all");
const path = require("path");

export const DEFAULT_CONTROLLER_PATTERN = /(.+\-controller)\.js$/;
export const DEFAULT_IGNORE_PATTERN = /^\.(git|svn|node_modules)$/;

@injectable()
export class PathControllerLoader implements ControllerLoader {

    constructor(
        private baseDir: string = "",
        private filePattern: RegExp = DEFAULT_CONTROLLER_PATTERN,
        private ignorePattern: RegExp = DEFAULT_IGNORE_PATTERN){

        }

    public async loadControllers() : Promise<Type<object>[]> {

        //Controller Files is shapes as { file: { c1: c1Class; c2: c2Class }}
        let controllerFiles = includeAll(<any>{
            dirname: path.join(process.cwd(), this.baseDir),
            filter: this.filePattern,
            excludeDirs: this.ignorePattern,
            flatten: true
        }) || [];

        let candidateControllers: any[] = flatten(map(values(controllerFiles), (exportedData: any) => {
            return values(exportedData);
        }));

        return candidateControllers;
    }
}
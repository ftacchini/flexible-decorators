import { Type } from "flexible-core";
import { injectable } from "tsyringe";

@injectable()
export class ExplicitControllerLoader {

    constructor(private candidateControllers: Type<object>[]) {
    }

    public async loadControllers(): Promise<Type<object>[]>{
        return this.candidateControllers;
    }

}
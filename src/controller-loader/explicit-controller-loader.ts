import { Type } from "flexible-core";

export class ExplicitControllerLoader {

    constructor(private candidateControllers: Type<object>[]) {
    }

    public async loadControllers(): Promise<Type<object>[]>{
        return this.candidateControllers;
    }

}
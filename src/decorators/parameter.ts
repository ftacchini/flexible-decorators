import { EXTRACTOR_KEY } from "./decorator-keys";
import { Type, FlexibleExtractor, ExtractorConfiguration } from "flexible-core";

export const Param = function attributeDefinition<T extends FlexibleExtractor>(
    extractor?: Type<T>,
    configuration?: ExtractorConfiguration<T>) {

    return (target: any, property: any, index: number) => {
        if (!Reflect.hasMetadata(EXTRACTOR_KEY, target, property)) {
            Reflect.defineMetadata(EXTRACTOR_KEY, [], target, property);
        }

        var routes: ExtractorDefinition<T>[] = Reflect.getMetadata(EXTRACTOR_KEY, target, property);

        routes.push({ 
            index: index,
            extractor: extractor, 
            configuration: configuration});
    }
}


export interface ExtractorDefinition<T extends FlexibleExtractor> {
    readonly index: number,
    readonly extractor: Type<T>,
    readonly configuration?: ExtractorConfiguration<T>;
}
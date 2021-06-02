const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const STRIP_INITIALIZER_STRINGS = /((\"(.+)\")|(\'(.+)\'))+/g;
const STRIP_INITIALIZERS_AND_SPACES = /((=.+?((?=,)|(?=$)))|(\s))+/g;
const SPLIT_BY = /,/g

export class JsHelper {
    
    private constructor() {

    }

    private static _instance: JsHelper;
    public static get instance() {
        return this._instance || (this._instance = new JsHelper());
    }

    public readFunctionParamNames(func: Function) : string[] {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')'))
            .replace(STRIP_INITIALIZER_STRINGS, '')
            .replace(STRIP_INITIALIZERS_AND_SPACES, '')
            .split(SPLIT_BY)
            .filter(value => value);

        return result || [];
    }
}
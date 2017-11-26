export interface Node {
    start: number;
    end: number;
    type: 'Object' | 'Array' | 'Boolean' | 'String' | 'Number' | 'Null';
    [key: string]: any;
}

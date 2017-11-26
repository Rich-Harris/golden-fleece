export interface Node {
    start: number;
    end: number;
    type: 'Object' | 'Array' | 'Boolean' | 'String' | 'Number' | 'Null' | 'Property' | 'Key';
    [key: string]: any;
}

export interface Node {
    start: number;
    end: number;
    type: 'ObjectExpression' | 'ArrayExpression' | 'Literal' | 'Property' | 'Identifier';
    [key: string]: any;
}

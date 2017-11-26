import { Node } from './interfaces';
export default class Parser {
    str: string;
    index: number;
    value: Node;
    constructor(str: string);
    acornError(err: any): void;
    allowWhitespace(): void;
    error(message: string, index?: number): void;
    eat(str: string, required?: boolean): boolean;
    match(str: string): boolean;
    peek(): string;
    read(pattern: RegExp): string;
    readUntil(pattern: RegExp): string;
    readArray(): Node;
    readLiteral(value: boolean | null): Node;
    readNumber(): Node;
    readObject(): Node;
    readProperty(): Node;
    readPropertyKey(): Node;
    readString(quote: string): Node;
    readValue(): Node;
    remaining(): string;
    requireWhitespace(): void;
}

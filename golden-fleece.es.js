var whitespace = /[ \t\r\n]/;

var Parser = /** @class */ (function () {
    function Parser(str) {
        this.str = str;
        this.index = 0;
        this.value = this.readValue();
        this.allowWhitespace();
        if (this.index < this.str.length) {
            throw new Error("Unexpected character '" + this.peek() + "'");
        }
    }
    Parser.prototype.acornError = function (err) {
        this.error(err.message.replace(/ \(\d+:\d+\)$/, ''), err.pos);
    };
    Parser.prototype.allowWhitespace = function () {
        while (this.index < this.str.length &&
            whitespace.test(this.str[this.index])) {
            this.index++;
        }
    };
    Parser.prototype.error = function (message, index) {
        if (index === void 0) { index = this.index; }
        throw new Error(message); // TODO
        // throw new ParseError(message, this.template, index, this.filename);
    };
    Parser.prototype.eat = function (str, required) {
        if (this.match(str)) {
            this.index += str.length;
            return true;
        }
        if (required) {
            this.error("Expected " + str);
        }
        return false;
    };
    Parser.prototype.match = function (str) {
        return this.str.slice(this.index, this.index + str.length) === str;
    };
    Parser.prototype.peek = function () {
        return this.str[this.index];
    };
    Parser.prototype.read = function (pattern) {
        var match = pattern.exec(this.str.slice(this.index));
        if (!match || match.index !== 0)
            return null;
        this.index += match[0].length;
        return match[0];
    };
    Parser.prototype.readUntil = function (pattern) {
        if (this.index >= this.str.length)
            this.error('Unexpected end of input');
        var start = this.index;
        var match = pattern.exec(this.str.slice(start));
        if (match) {
            var start_1 = this.index;
            this.index = start_1 + match.index;
            return this.str.slice(start_1, this.index);
        }
        this.index = this.str.length;
        return this.str.slice(start);
    };
    Parser.prototype.readBoolean = function (value) {
        return {
            start: this.index - (value ? 4 : 5),
            end: this.index,
            type: 'Boolean',
            value: value
        };
    };
    Parser.prototype.readArray = function () {
        var array = {
            start: this.index - 1,
            end: null,
            type: 'Array',
            elements: []
        };
        this.allowWhitespace();
        while (this.peek() !== ']') {
            var element = this.readValue();
            this.allowWhitespace();
            if (!this.eat(','))
                break;
            this.allowWhitespace();
        }
        this.eat(']', true);
        array.end = this.index;
        return array;
    };
    Parser.prototype.readObject = function () {
        var object = {
            start: this.index - 1,
            end: null,
            type: 'Object',
            properties: []
        };
        this.allowWhitespace();
        while (this.peek() !== '}') {
            var element = this.readValue();
            this.allowWhitespace();
            if (!this.eat(','))
                break;
            this.allowWhitespace();
        }
        this.eat('}', true);
        object.end = this.index;
        return object;
    };
    Parser.prototype.readValue = function () {
        this.allowWhitespace();
        if (this.eat('['))
            return this.readArray();
        if (this.eat('{'))
            return this.readObject();
        if (this.match('true'))
            return this.readBoolean(true);
        if (this.match('false'))
            return this.readBoolean(false);
        // TODO strings, numbers
    };
    Parser.prototype.remaining = function () {
        return this.str.slice(this.index);
    };
    Parser.prototype.requireWhitespace = function () {
        if (!whitespace.test(this.str[this.index])) {
            this.error("Expected whitespace");
        }
        this.allowWhitespace();
    };
    return Parser;
}());

function parse(str) {
    var parser = new Parser(str);
    return parser.value;
}

export { parse };

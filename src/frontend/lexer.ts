// let x = 45 + ( foo * bar )

export enum TokenType {
    // literals
    Null,
    Number,
    Identifier,

    // keywords
    Let,

    // grouping and operators
    Equals,
    OpenParen,
    CloseParen,
    BinaryOperator,

    // end of file
    EOF,
}

const KEYWORDS: Record<string, TokenType> = {
    "let": TokenType.Let,
    "null": TokenType.Null,
}

export interface Token {
    value: string,
    type: TokenType,
}

function token(value = "", type: TokenType): Token {
    return { value, type }
}

function isAlpha(source: string) {
    return source.toUpperCase() != source.toLowerCase()
}

function isInt(source: string) {
    const c = source.charCodeAt(0)
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)]

    return (c >= bounds[0] && c <= bounds[1])
}

function isSkippable(source: string) {
    return source == " " || source == "\n" || source == "\t"
}

export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>()
    const src = sourceCode.split("") // split on every single character

    // build each token until EOF
    while (src.length > 0) {
        if (src[0] == "(") {
            tokens.push(token(src.shift(), TokenType.OpenParen))
        } else if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.CloseParen))
        } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
            tokens.push(token(src.shift(), TokenType.BinaryOperator))
        } else if (src[0] == "=") {
            tokens.push(token(src.shift(), TokenType.Equals))
        } else {
            // handle multicharacter tokens
            if (isInt(src[0])) {
                let num = ""
                while (src.length > 0 && isInt(src[0])) {
                    num += src.shift()
                }

                tokens.push(token(num, TokenType.Number))
            } else if (isAlpha(src[0])) {
                let identifier = ""
                while (src.length > 0 && isAlpha(src[0])) {
                    identifier += src.shift()
                }

                // check for reserved keywords
                const reserved = KEYWORDS[identifier]

                // if a reserved keyword is found, reserved would be a number (tokentype is an enum) 
                // create the reserved token
                if (typeof reserved == "number") {  
                    tokens.push(token(identifier, reserved))
                } else { // create the identifier
                    tokens.push(token(identifier, TokenType.Identifier))
                }
            } else if (isSkippable(src[0])) {
                src.shift() // skip
            } else {
                console.error("Unrecognised character found in source: ", src[0])
                src.shift()
            }
        }
    }

    tokens.push(token("EndOfFile", TokenType.EOF))
    return tokens
}
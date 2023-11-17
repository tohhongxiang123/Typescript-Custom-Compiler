import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier, NullLiteral } from './ast'
import { tokenize, Token, TokenType } from './lexer'

export default class Parser {
    private tokens: Token[] = []

    private notEOF() {
        return this.tokens[0].type != TokenType.EOF
    }

    private at() {
        // returns the current token
        return this.tokens[0] as Token
    }

    private next() {
        // gets the current token, and removes it from token stream
        const previous = this.tokens.shift() as Token;
        return previous
    }

    private expect(type: TokenType, error: any) {
        const prev = this.tokens.shift() as Token
        if (!prev || prev.type != type) {
            console.error("Parser error:\n", error, prev, " - Expecting: ", type)
            process.exit(1)
        }

        return prev
    }

    public produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode)

        const program: Program = {
            kind: "Program",
            body: []
        }

        while (this.notEOF()) {
            program.body.push(this.parseStmt())
        }

        return program
    }

    private parseStmt(): Stmt {
        // skip to parse expr
        return this.parseExpr();
    }

    // order of precedence
    // AssignmentExpr (Lowest)
    // MemberExpr
    // FunctionCall
    // LogicalExpr
    // ComparisonExpr
    // AdditiveExpr 
    // MultiplicativeExpr
    // Unary
    // PrimaryExpr (Highest)
    // We want to parse highest precedence expressions last
    private parseExpr(): Expr {
        return this.parseAdditiveExpr()
    }

    // additive is left-hand
    // (10 + 5) - 5
    private parseAdditiveExpr(): Expr {
        let left = this.parseMultiplicativeExpr()

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.next().value
            const right = this.parseMultiplicativeExpr()

            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr
        }

        return left
    }

    private parseMultiplicativeExpr(): Expr {
        let left = this.parsePrimaryExpr()

        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
            const operator = this.next().value
            const right = this.parsePrimaryExpr()

            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr
        }

        return left
    }

    private parsePrimaryExpr(): Expr {
        const tokenType = this.at().type

        switch (tokenType) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.next().value } as Identifier
            case TokenType.Null:
                this.next() // advance past null keyword
                return { kind: "NullLiteral", value: "null" } as NullLiteral
            case TokenType.Number:
                return { kind: "NumericLiteral", value: parseFloat(this.next().value) } as NumericLiteral
            case TokenType.OpenParen:
                this.next() // consume opening paren

                const value = this.parseExpr()

                this.expect(TokenType.CloseParen, `Expected '(', received ${value}`) // consume closing paren

                return value
            default:
                console.error("Unexpected token found during parsing", this.at())
                process.exit(1)
        }
    }
}
import fs from 'fs'
import { TokenType, tokenize } from './frontend/lexer'
import Parser from './frontend/parser'
import promptSync from 'prompt-sync'
import { evaluate } from './runtime/interpreter'

console.log(typeof TokenType)
repl()

function repl() {
    const parser = new Parser()
    console.log("Repl v0.1")

    const prompt = promptSync({ sigint: true })
    while (true) {
        const input = prompt("> ")

        if (!input || input.includes("exit")) {
            process.exit(0)
        }

        const tokenTypes = tokenize(input)
        console.log(tokenTypes)

        const program = parser.produceAST(input);
        console.log(JSON.stringify(program, null, 2))

        const result = evaluate(program)
        console.log(result)

        console.log("--------\n\n")
    }
}
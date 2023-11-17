import { RuntimeVal, NumberVal, NullVal } from './values'
import { Stmt, NodeType, NumericLiteral, BinaryExpr, Program } from '../frontend/ast'

function evaluateProgram(program: Program): RuntimeVal {
    let lastEvaluated: RuntimeVal = { type: "null", value: "null" } as NullVal

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement)
    }

    return lastEvaluated
}

function evaluateNumericBinaryExpr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
    let result = 0
    if (operator == "+") {
        result = lhs.value + rhs.value
    } else if (operator == "-") {
        result = lhs.value - rhs.value
    } else if (operator == "*") {
        result = lhs.value * rhs.value
    } else if (operator == "/") {
        // TODO: Check division by zero
        result = lhs.value / rhs.value
    } else {
        result = lhs.value % rhs.value
    }

    return { value: result, type: "number" }
}

function evaluateBinaryExpr(binop: BinaryExpr): RuntimeVal {
    const leftHandSide = evaluate(binop.left);
    const rightHandSide = evaluate(binop.right)

    if (leftHandSide.type == "number" && rightHandSide.type == "number") {
        return evaluateNumericBinaryExpr(leftHandSide as NumberVal, rightHandSide as NumberVal, binop.operator)
    }

    // if one or both are NULL
    return { type: "null", value: "null" } as NullVal
}

export function evaluate(astNode: Stmt): RuntimeVal {
    switch (astNode.kind) {
        case "NumericLiteral":
            return { value: ((astNode as NumericLiteral).value), type: "number" } as NumberVal
        case "NullLiteral":
            return { value: "null", type: "null" } as NullVal
        case "BinaryExpr":
            return evaluateBinaryExpr(astNode as BinaryExpr)
        case "Program":
            return evaluateProgram(astNode as Program)
        default:
            console.error(`This AST Node has not yet been setup for interpretation: ${JSON.stringify(astNode)}`)
            process.exit(1)
    }
}
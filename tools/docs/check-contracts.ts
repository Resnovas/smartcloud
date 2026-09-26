/**
 * @file tools/docs/check-contracts.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

// Checks that every exported value of a project carries its API contract in
// the published declarations.
//
//   node tools/docs/check-contracts.ts packages/config
//
// Reads `<project>/dist/**/*.d.ts` (so run it after the build), because the
// contract has to survive into what consumers see, not only live in the
// source. Every exported const, function and class needs a description and an
// `@example` that imports from the package's public path; every callable needs
// an `@param` per parameter and `@returns` unless it returns void. Exports
// marked `@internal` are not part of the public entry point, so their example
// may not import from it and is not required. @effect/docgen type-checks the
// examples; this check only makes sure they are there. Runs on Node's built-in
// TypeScript support.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

const project = process.argv[2]
if (project === undefined) {
  console.error('Usage: node tools/docs/check-contracts.ts <project root>')
  process.exit(2)
}

interface PackageJson {
  readonly name: string
}

const isPackageJson = (value: unknown): value is PackageJson =>
  typeof value === 'object' && value !== null && 'name' in value && typeof value.name === 'string'

const manifest: unknown = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'))
if (!isPackageJson(manifest)) {
  console.error(`${project}/package.json has no name.`)
  process.exit(2)
}
const publicPath = manifest.name

const dist = join(project, 'dist')
if (!existsSync(dist)) {
  console.error(`${dist} does not exist: build the project first.`)
  process.exit(2)
}

const declarations = (dir: string): ReadonlyArray<string> =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return declarations(path)
    return entry.name.endsWith('.d.ts') ? [path] : []
  })

const files = declarations(dist)
const program = ts.createProgram([...files], {
  noEmit: true,
  skipLibCheck: true,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2024,
})
const checker = program.getTypeChecker()

const tagText = (tag: ts.JSDocTag): string => ts.getTextOfJSDocComment(tag.comment) ?? ''

const problems: string[] = []

const exported = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)

// The first overload carries the documentation, as TSDoc and docgen expect.
const seen = new Set<string>()

const check = (file: ts.SourceFile, node: ts.Node, name: string, callable: ts.Signature | undefined): void => {
  const where = `${relative(process.cwd(), file.fileName)}: ${name}`
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc)
  const doc = docs.at(-1)
  if (doc === undefined) {
    problems.push(`${where} has no documentation`)
    return
  }
  const tags: ReadonlyArray<ts.JSDocTag> = doc.tags ?? []
  const has = (tag: string): boolean => tags.some((t) => t.tagName.text === tag)
  const internal = has('internal')
  if ((ts.getTextOfJSDocComment(doc.comment) ?? '').trim() === '') problems.push(`${where} has no description`)
  const examples = tags.filter((t) => t.tagName.text === 'example')
  if (!internal) {
    if (examples.length === 0) problems.push(`${where} has no @example`)
    else if (!examples.some((t) => tagText(t).includes(`from '${publicPath}'`)))
      problems.push(`${where} has no @example importing from '${publicPath}'`)
  }
  if (callable === undefined) return
  const params = tags.filter(ts.isJSDocParameterTag)
  const documented = new Set(params.map((p) => p.name.getText()))
  const declared = callable.getDeclaration()?.parameters ?? []
  for (const param of declared) {
    if (ts.isIdentifier(param.name) && !documented.has(param.name.text))
      problems.push(`${where} has no @param for ${param.name.text}`)
  }
  if (params.length < declared.length) problems.push(`${where} documents ${params.length} of ${declared.length} parameters`)
  const returns = checker.getReturnTypeOfSignature(callable)
  if ((returns.flags & ts.TypeFlags.Void) === 0 && !has('returns')) problems.push(`${where} has no @returns`)
}

// A const is a function when it is declared with a function type. Values that
// merely happen to be callable, such as Effect metrics, are not held to
// @param and @returns.
const constSignature = (declaration: ts.VariableDeclaration): ts.Signature | undefined =>
  declaration.type !== undefined && ts.isFunctionTypeNode(declaration.type)
    ? checker.getTypeAtLocation(declaration.name).getCallSignatures()[0]
    : undefined

for (const path of files) {
  const file = program.getSourceFile(path)
  if (file === undefined) continue
  for (const statement of file.statements) {
    if (!exported(statement)) continue
    if (ts.isFunctionDeclaration(statement) && statement.name !== undefined) {
      const name = statement.name.text
      if (seen.has(`${path}#${name}`)) continue
      seen.add(`${path}#${name}`)
      check(file, statement, name, checker.getSignatureFromDeclaration(statement))
    } else if (ts.isClassDeclaration(statement) && statement.name !== undefined) {
      check(file, statement, statement.name.text, undefined)
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue
        check(file, statement, declaration.name.text, constSignature(declaration))
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'))
  console.error(`\n${problems.length} contract problem(s) in ${project}.`)
  process.exit(1)
}
console.log(`Every export in ${project} carries its contract.`)

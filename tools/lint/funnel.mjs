// Synced from Resnovas/.github templates/tools/lint/funnel.mjs. Edit it there.
import jsdoc from 'eslint-plugin-jsdoc'
import { readFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { headerFor } from '../license/check-headers.mjs'

const message = 'Do not assert that source code, a symbol or a source file is absent. Execute the affected public path and assert its observable behavior instead; retain legitimate output, redaction and UI absence assertions.'
const property = (node) => node?.type === 'MemberExpression' ? (node.computed ? node.property.value : node.property.name) : undefined
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url))

/** Delegate JSDoc checks unchanged except for reports on the exact licence header required by the repository. */
const withLicenceHeader = (rule) => ({
  ...rule,
  create(context) {
    const text = context.sourceCode.text.replaceAll('\r\n', '\n')
    const offset = text.startsWith('#!') ? text.indexOf('\n') + 1 : 0
    if (!text.slice(offset).startsWith('/**\n * @file ')) return rule.create(context)
    const file = relative(repositoryRoot, resolve(context.cwd, context.filename)).split(sep).join('/')
    const header = headerFor(readFileSync(new URL('../license/header.txt', import.meta.url), 'utf8'), file, String(new Date().getFullYear()))
    if (!text.slice(offset).startsWith(`${header}\n`)) return rule.create(context)
    const firstLine = offset ? 2 : 1
    const lastLine = firstLine + header.split('\n').length - 1
    return rule.create(Object.create(context, {
      report: { value(descriptor) {
        const line = descriptor.loc?.start?.line ?? descriptor.loc?.line ?? descriptor.node?.loc?.start?.line
        // Location-only settings errors and whole-file reports are not header diagnostics.
        const node = descriptor.node
        if (node?.type === 'Block' && node.loc.start.line === firstLine && node.loc.end.line === lastLine && line >= firstLine && line <= lastLine) return
        context.report(descriptor)
      } },
    }))
  },
})

// Both exports share one plugin identity, including consumer-enabled upstream rules.
const licenceAwareJsdoc = {
  meta: jsdoc.meta,
  rules: Object.fromEntries(Object.entries(jsdoc.rules).map(([name, rule]) => [name, withLicenceHeader(rule)])),
}

/** Follow local initializer provenance, not variable spelling, to distinguish source inspection from runtime output. */
export const noSourceAbsence = {
  meta: { type: 'problem', schema: [], messages: { behavior: message } },
  create(context) {
    const source = context.sourceCode
    const generated = new Map()
    const initializer = (node) => {
      if (node?.type !== 'Identifier') return undefined
      let scope = source.getScope(node)
      while (scope) {
        const variable = scope.set.get(node.name)
        if (variable) return variable.defs.find((definition) => definition.type === 'Variable')?.node.init
        scope = scope.upper
      }
    }
    const name = (node) => {
      if (node?.type === 'Identifier') {
        let scope = source.getScope(node)
        while (scope) {
          const variable = scope.set.get(node.name)
          if (variable) return variable.defs.find((definition) => definition.type === 'ImportBinding')?.node.imported?.name ?? node.name
          scope = scope.upper
        }
      }
      return node?.name ?? property(node)
    }
    const outputPath = (node) => generated.get(source.getScope(node).variableScope)?.has(source.getText(node)) === true
    const sourcePath = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return false
      seen.add(node)
      // A test-written fixture is observable program output, even when its extension is source code.
      if (outputPath(node)) return false
      if (node.type === 'Literal') return typeof node.value === 'string' && /\.(?:[cm]?[jt]sx?|py)$/.test(node.value)
      if (node.type === 'TemplateLiteral') return /\.(?:[cm]?[jt]sx?|py)$/.test(node.quasis.at(-1).value.cooked)
      if (node.type === 'Identifier') return sourcePath(initializer(node), seen)
      if (node.type === 'NewExpression' || node.type === 'CallExpression') return node.arguments.some((arg) => sourcePath(arg, seen))
      return false
    }
    const inspected = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (node.type === 'Identifier') return inspected(initializer(node), seen)
      if (node.type === 'AwaitExpression' || node.type === 'ChainExpression') return inspected(node.argument ?? node.expression, seen)
      if (node.type === 'MemberExpression') return inspected(node.object, seen)
      if (node.type !== 'CallExpression') return false
      const method = name(node.callee)
      if (['readFile', 'readFileSync', 'existsSync', 'access', 'accessSync'].includes(method) && sourcePath(node.arguments[0])) return true
      if (['getText', 'getSourceCode'].includes(method) && ['sourceCode', 'context'].includes(name(node.callee.object))) return true
      return inspected(node.callee.object, seen)
    }
    const report = (node) => context.report({ node, messageId: 'behavior' })
    return {
      UnaryExpression(node) {
        if (node.operator === '!' && inspected(node.argument)) report(node)
      },
      BinaryExpression(node) {
        if (['===', '=='].includes(node.operator) && ((node.right.value === false && inspected(node.left)) || (node.left.value === false && inspected(node.right)))) report(node)
      },
      CallExpression(node) {
        const method = name(node.callee)
        if (['writeFile', 'writeFileSync'].includes(method) && node.arguments[0]) {
          const scope = source.getScope(node).variableScope
          if (!generated.has(scope)) generated.set(scope, new Set())
          generated.get(scope).add(source.getText(node.arguments[0]))
        }
        if (method === 'doesNotMatch' && inspected(node.arguments[0])) report(node)
        if (['equal', 'strictEqual', 'deepEqual', 'deepStrictEqual'].includes(method) && node.arguments[1]?.value === false && inspected(node.arguments[0])) report(node)
        // Jest/Vitest negated matchers. Runtime-returned values do not carry source provenance.
        if (['toContain', 'toMatch', 'toHaveProperty', 'toBe', 'toEqual'].includes(method)) {
          let receiver = node.callee.object
          let negated = false
          if (property(receiver) === 'not') { negated = true; receiver = receiver.object }
          if (receiver?.type === 'CallExpression' && name(receiver.callee) === 'expect' && (negated || node.arguments[0]?.value === false) && inspected(receiver.arguments[0])) report(node)
        }
      },
    }
  },
}

const house = { rules: {
  'no-source-absence': noSourceAbsence,
  'require-description': licenceAwareJsdoc.rules['require-description'],
  'match-description': licenceAwareJsdoc.rules['match-description'],
} }

/** Shared additive rules: callers retain their parser, boundaries, declaration contracts and rationale checks. */
export const funnel = {
  plugins: { jsdoc: licenceAwareJsdoc, house },
  rules: {
    'house/no-source-absence': 'error',
    'jsdoc/informative-docs': ['error', { aliases: { run: ['runs', 'running'], main: ['entry', 'point'] } }],
  },
}

/** Apply to editable production TypeScript, alongside the repository's existing TypeScript parser. */
export const contracts = {
  plugins: { jsdoc: licenceAwareJsdoc, house },
  settings: { jsdoc: { mode: 'typescript' } },
  rules: {
    'jsdoc/require-jsdoc': ['error', {
      // The built-in arrow visitor skips callbacks; the explicit selector covers every arrow.
      require: { ArrowFunctionExpression: false, ClassDeclaration: true, ClassExpression: true, FunctionDeclaration: true, FunctionExpression: true, MethodDefinition: true },
      contexts: [':matches(ArrowFunctionExpression)', 'TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSMethodSignature', 'TSDeclareFunction', 'ExportNamedDeclaration', 'ExportDefaultDeclaration', 'ExportAllDeclaration'],
      checkAllFunctionExpressions: true,
      exemptEmptyConstructors: false,
      exemptEmptyFunctions: false,
    }],
    // Preserve the original house rule IDs for consumers; all jsdoc/ rules now share the same exemption.
    'jsdoc/require-description': 'off',
    'jsdoc/match-description': 'off',
    'house/require-description': ['error', { contexts: ['any'] }],
    'jsdoc/informative-docs': funnel.rules['jsdoc/informative-docs'],
    'jsdoc/no-blank-block-descriptions': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-throws': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/no-types': 'error',
    'jsdoc/valid-types': 'error',
    'jsdoc/require-template': 'error',
    'jsdoc/empty-tags': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/multiline-blocks': 'error',
    'jsdoc/tag-lines': ['error', 'never', { startLines: 1 }],
    'house/match-description': ['error', {
      contexts: ['any'],
      matchDescription: '^\\s*(?:-\\s*)?[\\p{Upper}`][\\s\\S]*[.!?]\\s*$',
      tags: { param: true, returns: true, throws: true, template: true },
      message: 'Write a complete sentence with an initial capital and closing punctuation; explain the contract rather than repeating the name.',
    }],
    'jsdoc/require-example': ['error', {
      enableFixer: false,
      contexts: [
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
        'ExportAllDeclaration',
        ':matches(ExportNamedDeclaration,ExportDefaultDeclaration) > ClassDeclaration > ClassBody > MethodDefinition:not([accessibility="private"]):not([accessibility="protected"]):not([key.type="PrivateIdentifier"])',
        'ExportNamedDeclaration > TSInterfaceDeclaration > TSInterfaceBody > TSMethodSignature',
        { context: ':matches(FunctionDeclaration,ArrowFunctionExpression,FunctionExpression,ClassDeclaration,ClassExpression,TSInterfaceDeclaration,TSTypeAliasDeclaration,MethodDefinition,TSMethodSignature,VariableDeclaration)', comment: 'JsdocBlock:has(JsdocTag[tag="public"])' },
      ],
    }],
  },
}

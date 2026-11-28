// Synced from Resnovas/.github templates/tools/lint/react.mjs. Edit it there.
// Extracted from Resnovas/Eventiva eslint.config.mjs at 9e379bf6a5c6629752d14e822dd673ae51894c81.
const lifecycleMessage = 'Initialize app-owned services in bootstrap before rendering product content. Derive render state or update its owner from events; use named React imports, never useEffect.'

/** Opt into bootstrap-owned initialization; compose these options with existing import and syntax restrictions. */
export const reactLifecycle = {
  rules: {
    'no-restricted-imports': ['error', { paths: [{ name: 'react', importNames: ['useEffect', 'default'], message: lifecycleMessage }] }],
    'no-restricted-modules': ['error', { paths: [{ name: 'react', message: lifecycleMessage }] }],
    'no-restricted-syntax': ['error', { selector: 'ImportExpression[source.value="react"]', message: lifecycleMessage }],
  },
}

// Keep timers separate from no-restricted-syntax so UI scopes cannot replace barrel restrictions.
const noZeroDelayUiTimer = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      stateOwner: 'Do not defer UI state with a zero-delay timer. Keep state in one owner and update it from the event; use scoped Effect scheduling for genuine timed work.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        // Spread arguments can supply a real delay; this rule does not evaluate runtime values.
        if (node.arguments.some((argument) => argument.type === 'SpreadElement')) return
        const delay = node.arguments[1]
        const literal = delay?.type === 'UnaryExpression' && ['-', '+'].includes(delay.operator) ? delay.argument : delay
        if (node.arguments.length !== 1 && !(literal?.type === 'Literal' && literal.value === 0)) return
        const callee = node.callee
        let global
        if (callee.type === 'Identifier' && callee.name === 'setTimeout') global = callee
        else if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          ['globalThis', 'window', 'self'].includes(callee.object.name) &&
          ((!callee.computed && callee.property.type === 'Identifier' && callee.property.name === 'setTimeout') ||
            (callee.computed && callee.property.type === 'Literal' && callee.property.value === 'setTimeout'))
        ) global = callee.object
        if (!global) return
        // A same-named local parameter/object is not the browser timer API.
        const reference = context.sourceCode.getScope(node).references.find((entry) => entry.identifier === global)
        if (reference?.resolved?.defs.length) return
        context.report({ node, messageId: 'stateOwner' })
      },
    }
  },
}

/** Apply only to reviewed UI source globs; genuine delayed work and lexical shadows retain their behavior. */
export const reactUiTimers = {
  plugins: { 'house-react': { rules: { 'no-zero-delay-ui-timer': noZeroDelayUiTimer } } },
  rules: { 'house-react/no-zero-delay-ui-timer': 'error' },
}

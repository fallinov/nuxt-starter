// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'style/comma-dangle': ['error', 'never'],
    'style/brace-style': ['error', '1tbs']
  }
})

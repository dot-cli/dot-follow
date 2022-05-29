module.exports = {
  trailingComma: 'none',
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  bracketSpacing: true,
  importOrder: [
    '^commands/(.*)$',
    '^lib/(.*)$',
    '^menus',
    '^menus/(.*)$',
    '^actions',
    '^actions/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true
}

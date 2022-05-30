// Register tsconfig paths
// See https://github.com/oclif/oclif/issues/288#issuecomment-1117064483
function registerTSConfigPaths(baseUrl = './') {
  const tsConfig = require('./tsconfig.json')
  const tsConfigPaths = require('tsconfig-paths')
  tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths
  })
}

module.exports = { registerTSConfigPaths }

import * as fs from 'fs'
// eslint-disable-next-line unicorn/import-style
import * as path from 'path'

export const readFile = (fileDir: string, filePath: string): string => {
  return fs.readFileSync(path.resolve(fileDir, filePath), 'utf8').trim()
}

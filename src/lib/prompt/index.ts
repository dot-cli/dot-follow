import * as inquirer from 'inquirer'

interface ChoiceOptions {
  choices: string[]
  message?: string
}

// see https://stackoverflow.com/a/49959557/610106
export const keypress = async (msg: string): Promise<void> => {
  console.log(msg)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      const byteArray = [...data]
      if (byteArray.length > 0 && byteArray[0] === 3) {
        console.log('^C')
        process.exit() // eslint-disable-line unicorn/no-process-exit, no-process-exit
      }
      process.stdin.setRawMode(false)
      resolve()
    })
  })
}

export const question = async ({
  message = 'Type an answer'
} = {}): Promise<string> => {
  const response = await inquirer.prompt([
    {
      name: 'result',
      message
    }
  ])
  return response.result
}

export const choice = async ({
  choices,
  message = 'choose an option'
}: ChoiceOptions): Promise<string> => {
  console.log() // Line break
  const responses = await inquirer.prompt([
    {
      name: 'result',
      message,
      type: 'list',
      choices
    }
  ])
  return responses.result
}

export const confirm = async (
  question = 'Are you sure?',
  initial = 'Y'
): Promise<boolean> => {
  const response = await inquirer.prompt([
    {
      name: 'confirm',
      type: 'confirm',
      message: question,
      default: initial
    }
  ])
  return response.confirm
}

export default { keypress, question, choice, confirm }

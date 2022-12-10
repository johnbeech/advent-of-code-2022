const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseInstructions (input, commands) {
  return input.split('\n').map(line => {
    const command = commands.find(command => line.match(command.regex))
    const matches = line.match(command.regex)
    return {
      command,
      matches
    }
  })
}

async function solveForFirstStar (input) {
  const commands = [{
    cycleTime: 1,
    regex: /noop/,
    fn: (context) => {
      console.log('No op')
      return context
    }
  }, {
    cycleTime: 2,
    regex: /add([a-z]) (-?\d+)/,
    fn: (context, register, value) => {
      context.registers[register] += Number.parseInt(value)
      console.log('Increased', { register }, 'by', { value }, { registers: context.registers, cycles: context.cycles })
      return context
    }
  }, {
    cycleTime: 0,
    regex: /.*/,
    fn: (context, any) => {
      console.error('Unmatched command', { any })
      return context
    }
  }]
  const instructions = parseInstructions(input, commands)
  const context = {
    cycles: 0,
    signalStrengths: [],
    registers: { x: 1 },
    executionMap: {}
  }

  const puzzleSamples = [20, 60, 100, 140, 180, 220]

  while (context.cycles < 220) {
    instructions.reduce((context, instruction) => {
      // register future commands
      const [, ...commandArgs] = instruction.matches
      const futureCycleTime = context.cycles + instruction.command.cycleTime
      const futureActions = context.executionMap[futureCycleTime] ?? []
      const futureCommand = (context) => {
        return instruction.command.fn(context, ...commandArgs)
      }
      futureActions.push(futureCommand)
      context.executionMap[futureCycleTime] = futureActions

      // update cycle count
      let n = 0
      while (n < instruction.command.cycleTime) {
        // execute current commands
        const nowActions = context.executionMap[context.cycles] ?? []
        context = nowActions.reduce((context, action) => {
          return action(context)
        }, context)
        delete context.executionMap[context.cycles]

        context.cycles++

        // process signal strength
        const signalStrength = context.registers.x * context.cycles
        if (puzzleSamples.includes(context.cycles)) {
          console.log('Signal Strength Recorded:', { context })
          context.signalStrengths.push(signalStrength)
        }
        n++
      }

      return context
    }, context)
  }

  const solution = context.signalStrengths.reduce((a, b) => {
    return a + b
  }, 0)
  report('Solution 1:', solution, { context })
}

function createEmptyGrid (width, height, symbol = ' ') {
  const result = []
  while (result.length < height) {
    const row = []
    while (row.length < width) {
      row.push(symbol)
    }
    result.push(row)
  }
  return result
}

function gridToString (input) {
  let result = ''
  input.forEach(row => {
    result += row.join('') + '\n'
  })
  return result
}

async function solveForSecondStar (input) {
  const commands = [{
    cycleTime: 1,
    regex: /noop/,
    fn: (context) => {
      console.log('No op')
      return context
    }
  }, {
    cycleTime: 2,
    regex: /add([a-z]) (-?\d+)/,
    fn: (context, register, value) => {
      context.registers[register] += Number.parseInt(value)
      console.log('Increased', { register }, 'by', { value }, { registers: context.registers, cycles: context.cycles })
      return context
    }
  }, {
    cycleTime: 0,
    regex: /.*/,
    fn: (context, any) => {
      console.error('Unmatched command', { any })
      return context
    }
  }]
  const instructions = parseInstructions(input, commands)
  const context = {
    cycles: 0,
    signalStrengths: [],
    registers: { x: 1 },
    executionMap: {},
    screen: createEmptyGrid(40, 6, '.')
  }

  while (context.cycles < 220) {
    instructions.reduce((context, instruction) => {
      // register future commands
      const [, ...commandArgs] = instruction.matches
      const futureCycleTime = context.cycles + instruction.command.cycleTime
      const futureActions = context.executionMap[futureCycleTime] ?? []
      const futureCommand = (context) => {
        return instruction.command.fn(context, ...commandArgs)
      }
      futureActions.push(futureCommand)
      context.executionMap[futureCycleTime] = futureActions

      // update cycle count
      let n = 0
      while (n < instruction.command.cycleTime) {
        // execute current commands
        const nowActions = context.executionMap[context.cycles] ?? []
        context = nowActions.reduce((context, action) => {
          return action(context)
        }, context)
        delete context.executionMap[context.cycles]

        context.cycles++

        // draw pixel to screen
        const spritePosition = context.registers.x
        const pixelColumn = (context.cycles - 1) % 40
        const pixelRow = Math.floor(((context.cycles - 1) % 240) / 40)
        const pixelOn = (pixelColumn >= spritePosition - 1 && pixelColumn <= spritePosition + 1)
        context.screen[pixelRow][pixelColumn] = pixelOn ? '#' : ' '

        if (context.cycles % (6 * 40) === 0) {
          console.log('Cycle', context.cycles)
          console.log(gridToString(context.screen))
        }
        n++
      }

      return context
    }, context)
  }

  await write(fromHere('solution-part2.md'), [
    '# Solution to Part 2',
    'Cycle ' + context.cycles,
    '',
    gridToString(context.screen),
    '',
    '```',
    JSON.stringify(context, null, 2),
    '```'
  ].join('\n'))

  const solution = '\n' + gridToString(context.screen)
  report('Solution 2:', solution)
}

run()

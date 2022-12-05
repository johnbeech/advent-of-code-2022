const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8'))

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const EMPTY_CRATE = ' '

function parseStacks (input) {
  const lines = input.split('\n').filter(line => line.includes('[') && line.includes(']'))
  const stacks = lines.reverse().reduce((acc, item) => {
    const crates = item.split('').reduce((acc, symbol, index) => {
      if ((index - 1) % 4 === 0) {
        const crate = symbol
        acc.push(crate)
      }
      return acc
    }, [])
    crates.forEach((crate, col) => {
      acc[col] = acc[col] ?? []
      if (crate !== EMPTY_CRATE) {
        acc[col].push(crate)
      }
    })
    return acc
  }, [])

  return stacks
}

function parseInstructions (input) {
  return input.split('\n').map(line => {
    const [move, x, from, a, to, b] = line.split(' ')
    if (move !== 'move') {
      return false
    }
    return {
      move,
      x: Number.parseInt(x),
      from,
      a: Number.parseInt(a),
      to,
      b: Number.parseInt(b)
    }
  }).filter(n => n)
}

async function solveForFirstStar (input) {
  const instructions = parseInstructions(input)
  const stacks = parseStacks(input)
  report({ instructions, stacks })

  const stackResult = instructions.reduce((stacks, instruction) => {
    const { x, a, b } = instruction
    let n = 0
    while (n < x) {
      const column = stacks[a - 1]
      const crate = column.pop()
      if (crate) {
        stacks[b - 1].push(crate)
      }
      n++
    }
    return stacks
  }, stacks)

  const solution = stackResult.reduce((acc, item) => {
    return acc + item.pop()
  }, '')

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const instructions = parseInstructions(input)
  const stacks = parseStacks(input)

  const stackResult = instructions.reduce((stacks, instruction) => {
    const { x, a, b } = instruction
    const crateBlock = []
    while (crateBlock.length < x) {
      const column = stacks[a - 1]
      const crate = column.pop()
      crateBlock.push(crate)
    }
    stacks[b - 1].push(...crateBlock.reverse())
    return stacks
  }, stacks)

  const solution = stackResult.reduce((acc, item) => {
    return acc + item.pop()
  }, '')

  report('Solution 2:', solution)
}

run()

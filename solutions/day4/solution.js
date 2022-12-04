const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseInstructionPairs (input) {
  return input.split('\n').map(line => {
    const [leftPair, rightPair] = line
      .split(',')
      .map(pair => {
        const [rangeStart, rangeEnd] = pair.split('-').map(n => Number.parseInt(n))
        const rangeLength = rangeEnd - rangeStart + 1
        return {
          rangeStart,
          rangeEnd,
          rangeLength
        }
      })
    const leftFullOverlap = (leftPair.rangeStart <= rightPair.rangeStart && leftPair.rangeEnd >= rightPair.rangeEnd)
    const rightFullOverlap = (rightPair.rangeStart <= leftPair.rangeStart && rightPair.rangeEnd >= leftPair.rangeEnd)
    const fullyContainsTheOtherPair = leftFullOverlap || rightFullOverlap
    return { leftPair, rightPair, leftFullOverlap, rightFullOverlap, fullyContainsTheOtherPair }
  })
}

async function solveForFirstStar (input) {
  const instructionPairs = parseInstructionPairs(input)
  console.log(instructionPairs)

  const numberOfAssignmentWithProp = instructionPairs.reduce((acc, item) => {
    const count = item.fullyContainsTheOtherPair ? 1 : 0
    return acc + count
  }, 0)

  const solution = numberOfAssignmentWithProp

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()

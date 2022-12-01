const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  report('Input:', input)

  const elves = input.split('\n').reduce((acc, item, index, list) => {
    const prevLine = list[index - 1]
    const elf = prevLine ? acc.pop() : { calories: [], totalCalories: 0 }
    if (item) {
      const foodItemCalories = Number.parseInt(item)
      elf.calories.push(foodItemCalories)
      elf.totalCalories += foodItemCalories
    }
    acc.push(elf)
    return acc
  }, [])

  const highestTotalCalories = Math.max(...elves.map(elf => elf.totalCalories))
  const solution = highestTotalCalories

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()

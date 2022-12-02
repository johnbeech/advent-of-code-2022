const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const outcomes = {
  WIN: {
    score: 6,
    name: 'win'
  },
  DRAW: {
    score: 3,
    name: 'draw'
  },
  LOSS: {
    score: 0,
    name: 'loss'
  }
}

const moves = {
  ROCK: {
    score: 1,
    name: 'rock',
    outcomes: {
      rock: outcomes.DRAW,
      paper: outcomes.WIN,
      scissors: outcomes.LOSS
    }
  },
  PAPER: {
    score: 2,
    name: 'paper',
    outcomes: {
      rock: outcomes.LOSS,
      paper: outcomes.DRAW,
      scissors: outcomes.WIN
    }
  },
  SCISSORS: {
    score: 3,
    name: 'scissors',
    outcomes: {
      rock: outcomes.WIN,
      paper: outcomes.LOSS,
      scissors: outcomes.DRAW
    }
  }
}

const codes = {
  A: moves.ROCK,
  B: moves.PAPER,
  C: moves.SCISSORS,
  X: moves.ROCK,
  Y: moves.PAPER,
  Z: moves.SCISSORS
}

function decodeStrategyGuide (input) {
  return input.split('\n').map(line => {
    const symbols = line.trim().split(' ')
    const [opponentPick, playerPick] = symbols.map(symbol => codes[symbol])

    const outcome = opponentPick.outcomes[playerPick.name]
    const score = playerPick.score + outcome.score

    return {
      symbols,
      opponentPick,
      playerPick,
      outcome,
      score
    }
  })
}

async function solveForFirstStar (input) {
  const strategyGuide = decodeStrategyGuide(input)

  const totalScore = strategyGuide.reduce((acc, item) => {
    return acc + item.score
  }, 0)

  const solution = totalScore

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()

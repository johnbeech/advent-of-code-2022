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

moves.ROCK.tactics = {
  win: moves.PAPER,
  draw: moves.ROCK,
  loss: moves.SCISSORS
}

moves.PAPER.tactics = {
  win: moves.SCISSORS,
  draw: moves.PAPER,
  loss: moves.ROCK
}

moves.SCISSORS.tactics = {
  win: moves.ROCK,
  draw: moves.SCISSORS,
  loss: moves.PAPER
}

const codes = {
  A: moves.ROCK,
  B: moves.PAPER,
  C: moves.SCISSORS,
  X: moves.ROCK,
  Y: moves.PAPER,
  Z: moves.SCISSORS
}

const alternateCodes = {
  A: moves.ROCK,
  B: moves.PAPER,
  C: moves.SCISSORS,
  X: outcomes.LOSS,
  Y: outcomes.DRAW,
  Z: outcomes.WIN
}

function decodeStrategyGuide (input) {
  return input.split('\n').map(line => {
    const symbols = line.trim().split(' ')
    const [opponentPick, playerPick] = symbols.map(symbol => codes[symbol])
    const [, desiredOutcome] = symbols.map(symbol => alternateCodes[symbol])

    const outcome = opponentPick.outcomes[playerPick.name]
    const score = playerPick.score + outcome.score

    const chosenMove = opponentPick.tactics[desiredOutcome.name]
    const alternateScore = chosenMove.score + desiredOutcome.score

    return {
      symbols,
      opponentPick,
      playerPick,
      outcome,
      score,
      alternateScore
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
  const strategyGuide = decodeStrategyGuide(input)

  const totalScore = strategyGuide.reduce((acc, item) => {
    return acc + item.alternateScore
  }, 0)

  const solution = totalScore

  report('Solution 2:', solution)
}

run()

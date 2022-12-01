const solutionId = process.argv[2]

async function start () {
  try {
    await runSolution()
  } catch (ex) {
    if (!solutionId) {
      console.error('No solution ID provided; please re-run with an argument, e.g.: npm start day1, or: node run day1')
    } else {
      await copyTemplate()
    }
  }
}

function runSolution () {
  return require(`./solutions/${solutionId}/solution.js`)
}

async function copyTemplate () {
  try {
    await require('./copy-template.js')
    await runSolution()
  } catch (ex) {
    console.error(`Unable to run solution for '${solutionId}': ${ex}`, ex.stack)
  }
}

start()

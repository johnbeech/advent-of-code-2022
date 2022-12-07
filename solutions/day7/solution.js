const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

class Directory {
  constructor (parent, dirname) {
    this.parent = parent
    this.dirname = dirname ?? ''
    this.dirs = {}
    this.files = {}
    this.size = 0
  }

  get fullpath () {
    const path = []
    let cdir = this
    do {
      path.unshift(cdir.dirname)
      cdir = cdir.parent
    } while (cdir)
    return path.join('/')
  }
}

class FileRecord {
  constructor (parent, filesize, filename) {
    this.parent = parent
    this.filesize = filesize
    this.filename = filename
  }
}

class Computer {
  constructor () {
    this._cwd = ['']
    this._dirs = {
      '/': new Directory()
    }
  }

  addDir (dirname) {
    if (dirname === '/' || dirname === '..') {
      return
    }
    const { cdir } = this
    const parent = cdir
    const newDir = new Directory(parent, dirname)
    if (!cdir.dirs[newDir.fullpath]) {
      this._dirs[newDir.fullpath] = newDir
    }
    if (!cdir.dirs[dirname]) {
      cdir.dirs[dirname] = newDir
    }
  }

  addFile (filesize, filename) {
    const { cdir } = this
    const parent = cdir
    cdir.files[filename] = new FileRecord(parent, filesize, filename)
    let up = cdir
    do {
      up.size += filesize
      up = up.parent
    } while (up)
  }

  get cwd () {
    return this._cwd.length > 1 ? this._cwd.join('/') : '/'
  }

  get cdir () {
    const { cwd } = this
    return this._dirs[cwd]
  }

  get dirs () {
    return Object.values(this._dirs)
  }

  cd (dirname) {
    if (dirname === '..') {
      this._cwd.pop()
    } else if (dirname.slice(0, 1) === '/') {
      this._cwd = ['']
    } else {
      this._cwd.push(dirname)
    }
  }

  ls (all, opts, tab = '') {
    const { cdir } = opts ?? this
    console.log(`${tab}- ${cdir.dirname || '/'} (dir, size=${cdir.size})`)
    Object.values(cdir.dirs).forEach(dir => {
      if (all) {
        this.ls(all, { cdir: dir }, tab + '  ')
      }
    })
    Object.values(cdir.files).forEach(file => {
      console.log(`${tab}- ${file.filename} (file, size=${file.filesize})`)
    })
  }
}

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function processInstructions (input, computer) {
  const fns = {
    '$ cd': (line) => {
      const dirname = line.slice(4).trim()
      computer.cd(dirname)
    },
    '$ ls': (line) => {
      // do nothing
      // computer.ls
    },
    dir: (line) => {
      const dirname = line.slice(4)
      computer.addDir(dirname)
    },
    file: (line) => {
      const [filesize, filename] = line.split(' ', 2)
      computer.addFile(Number.parseInt(filesize), filename)
    }
  }

  input.split('\n').filter(n => n).forEach((line, index) => {
    const key = line.slice(0, 4).trim()
    const fn = fns[key] ?? fns.file
    fn(line)
  })

  return computer
}

async function solveForFirstStar (input) {
  const computer = new Computer()
  const instructions = processInstructions(input, computer)

  report('Instructions:', { instructions })

  computer.cd('/')
  computer.ls(true)

  const solution = computer.dirs.sort((a, b) => {
    return a.size > b.size ? 1 : -1
  }).filter(dir => {
    return dir.size <= 100000
  }).reduce((acc, dir) => {
    return acc + dir.size
  }, 0)

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const computer = new Computer()
  const instructions = processInstructions(input, computer)

  report('Instructions:', { instructions })

  computer.cd('/')
  computer.ls(true)

  const totalDiskSpace = 70000000
  const spaceNeeded = 30000000

  const usedSpace = computer._dirs['/'].size

  const solution = computer.dirs.map(dir => {
    const spaceIfDeleted = totalDiskSpace - usedSpace + dir.size
    const worthDeleting = spaceIfDeleted >= spaceNeeded
    return {
      path: dir.fullpath,
      size: dir.size,
      spaceIfDeleted,
      worthDeleting
    }
  }).filter(item => item.worthDeleting).sort((a, b) => {
    return a.size > b.size ? 1 : -1
  })[0].size

  report('Solution 2:', solution)
}

run()

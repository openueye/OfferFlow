import fs from 'node:fs'
import path from 'node:path'

const mode = process.argv[2]
const rootDir = process.cwd()

const schemaMap = {
  sqlite: 'prisma/schema.sqlite.prisma',
  pg: 'prisma/schema.pg.prisma',
}

const envSourceMap = {
  sqlite: '.env.sqlite',
  pg: '.env.pg',
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .reduce((env, line) => {
      const separatorIndex = line.indexOf('=')
      const key = line.slice(0, separatorIndex).trim()
      const value = line.slice(separatorIndex + 1).trim()
      env[key] = value
      return env
    }, {})
}

function writeEnvFile(filePath, env) {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  fs.writeFileSync(filePath, `${content}\n`)
}

if (!schemaMap[mode]) {
  console.error('Usage: node scripts/switch-db.mjs <sqlite|pg>')
  process.exit(1)
}

if (mode === 'sqlite') {
  const schemaSource = path.join(rootDir, schemaMap.sqlite)
  const schemaTarget = path.join(rootDir, 'prisma/schema.prisma')
  const templateEnv = readEnvFile(path.join(rootDir, envSourceMap.sqlite))
  const currentEnv = readEnvFile(path.join(rootDir, '.env'))

  fs.copyFileSync(schemaSource, schemaTarget)
  writeEnvFile(path.join(rootDir, '.env'), {
    ...templateEnv,
    ...currentEnv,
    DATABASE_URL: templateEnv.DATABASE_URL,
  })
} else {
  const pgEnvPath = path.join(rootDir, envSourceMap.pg)
  const schemaSource = path.join(rootDir, schemaMap.pg)
  const schemaTarget = path.join(rootDir, 'prisma/schema.prisma')

  if (!fs.existsSync(pgEnvPath)) {
    console.error(
      'Missing .env.pg. Copy .env.pg.example to .env.pg and fill in PostgreSQL values first.'
    )
    process.exit(1)
  }

  fs.copyFileSync(schemaSource, schemaTarget)
  fs.copyFileSync(pgEnvPath, path.join(rootDir, '.env'))
}

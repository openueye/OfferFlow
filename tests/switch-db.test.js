import test from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const switchScript = path.join(projectRoot, 'scripts/switch-db.mjs')

test('SQLite mode updates local environment without creating a shared schema.prisma', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'offerflow-switch-db-'))
  t.after(async () => {
    const { rm } = await import('node:fs/promises')
    await rm(fixtureRoot, { recursive: true, force: true })
  })
  await mkdir(path.join(fixtureRoot, 'prisma'))
  await writeFile(path.join(fixtureRoot, '.env.sqlite'), 'DATABASE_URL="file:./dev.db"\n')
  await writeFile(
    path.join(fixtureRoot, '.env'),
    'DATABASE_URL="postgresql://old"\nJWT_SECRET="keep-me"\n'
  )
  await writeFile(path.join(fixtureRoot, 'prisma/schema.sqlite.prisma'), 'sqlite schema\n')

  const result = spawnSync(process.execPath, [switchScript, 'sqlite'], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(
    await readFile(path.join(fixtureRoot, '.env'), 'utf8'),
    'DATABASE_URL="file:./dev.db"\nJWT_SECRET="keep-me"\n'
  )
  await assert.rejects(access(path.join(fixtureRoot, 'prisma/schema.prisma')))
})

test('Prisma commands select an explicit provider-specific schema', async () => {
  const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'))
  const scripts = packageJson.scripts

  assert.match(scripts.postinstall, /--schema prisma\/schema\.pg\.prisma/)
  assert.match(scripts['db:generate:sqlite'], /--schema prisma\/schema\.sqlite\.prisma/)
  assert.match(scripts['db:generate:pg'], /--schema prisma\/schema\.pg\.prisma/)
  assert.match(scripts['db:sqlite'], /npm run db:generate:sqlite/)
  assert.match(scripts['db:pg'], /npm run db:generate:pg/)
  assert.doesNotMatch(Object.values(scripts).join('\n'), /--schema prisma\/schema\.prisma/)
})

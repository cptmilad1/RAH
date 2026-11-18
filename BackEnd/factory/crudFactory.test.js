const test = require('node:test')
const assert = require('node:assert/strict')
const createCrudFactory = require('./crudFactory')
const AppError = require('./AppError')

test('executes generic CRUD queries using parameterized values and scoped rows', async () => {
  const calls = []
  const database = {
    query: async (...args) => {
      calls.push(args)
      return { rows: [] }
    },
  }
  const crud = createCrudFactory({
    tableName: 'parcels',
    columns: ['description', 'sender_id'],
    scope: (req) => ({ sender_id: req.user.userId }),
    database,
  })
  const req = {
    user: { userId: '17' },
    params: { id: '31' },
    body: { description: 'safe value' },
  }

  await crud.get(req)
  await crud.post(req)
  await crud.put(req)

  assert.deepEqual(calls, [
    ['SELECT * FROM parcels WHERE sender_id = $1', ['17']],
    [
      'INSERT INTO parcels (description, sender_id) VALUES ($1, $2) RETURNING *',
      ['safe value', '17'],
    ],
    [
      'UPDATE parcels SET description = $1 WHERE sender_id = $2 AND id = $3 RETURNING *',
      ['safe value', '17', '31'],
    ],
  ])
})

test('rejects unknown tables, fields, and omitted scopes with AppError', async () => {
  assert.throws(() => createCrudFactory({ tableName: 'users' }), AppError)

  const database = { query: async () => ({ rows: [] }) }
  const crud = createCrudFactory({
    tableName: 'parcels',
    columns: ['description', 'sender_id'],
    scope: (req) => ({ sender_id: req.user.userId }),
    database,
  })
  const unscopedCrud = createCrudFactory({
    tableName: 'parcels',
    columns: ['description'],
    scope: () => ({}),
    database,
  })

  await assert.rejects(
    unscopedCrud.get({ user: { userId: '17' } }),
    (error) => error instanceof AppError && error.status === 403,
  )
  await assert.rejects(
    crud.post({ user: { userId: '17' }, body: { status: 'delivered' } }),
    (error) => error instanceof AppError && error.status === 400,
  )
})

test('passes the configured database pool to domain-specific parcel operations', async () => {
  const database = { query: async () => ({ rows: [] }) }
  let usedDatabase
  const crud = createCrudFactory({
    operations: {
      get: async (pool, req) => {
        usedDatabase = pool
        return req.user.userId
      },
    },
    database,
  })

  assert.equal(await crud.get({ user: { userId: '17' } }), '17')
  assert.equal(usedDatabase, database)
})

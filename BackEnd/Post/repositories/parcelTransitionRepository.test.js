const test = require('node:test')
const assert = require('node:assert/strict')
const { ParcelTransitionService } = require('./parcelTransitionRepository')

test('rolls back and releases the client when the parcel does not exist', async () => {
  const statements = []
  let released = false
  const client = {
    async query(statement) {
      statements.push(statement)
      if (statement.startsWith('SELECT p.id')) return { rowCount: 0, rows: [] }
      return { rowCount: 0, rows: [] }
    },
    release() {
      released = true
    },
  }
  const service = new ParcelTransitionService({
    connect: async () => client,
  })

  await assert.rejects(service.confirmHandoff('42', 'missing-code'), (error) => error.status === 404)
  assert.equal(statements[0], 'BEGIN')
  assert.match(statements[1], /FOR UPDATE$/)
  assert.equal(statements[2], 'ROLLBACK')
  assert.equal(released, true)
})

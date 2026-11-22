const pool = require('../db.js')
const AppError = require('./AppError')

const allowedTables = new Set([
  'addresses',
  'parcel_assignments',
  'parcel_cancellations',
  'parcel_items',
  'parcel_status_history',
  'parcels',
])

function validateIdentifier(identifier, label) {
  if (typeof identifier !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new AppError(400, `Invalid ${label}!`)
  }
}

function validateTableName(tableName) {
  if (!allowedTables.has(tableName)) {
    throw new AppError(400, 'Invalid table name!')
  }
}

function validateId(id) {
  if ((typeof id !== 'string' && typeof id !== 'number') || !/^[A-Za-z0-9_-]{1,128}$/.test(String(id))) {
    throw new AppError(400, 'Please provide a valid id!')
  }
}

function getEntries(body, allowedColumns, restrictedColumns = new Set()) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'Please provide valid data!')
  }

  const entries = Object.entries(body)
  if (entries.length === 0) {
    throw new AppError(400, 'Please provide valid data!')
  }

  for (const [key] of entries) {
    validateIdentifier(key, 'column name')
    if (!allowedColumns.has(key) || restrictedColumns.has(key)) {
      throw new AppError(400, 'Invalid column name!')
    }
  }

  return entries
}

function getScope(scope, req, action, allowUnscoped, allowedColumns, idColumn) {
  if (typeof scope !== 'function') {
    throw new AppError(403, 'A resource access policy is required.')
  }

  const values = scope(req, action)
  if (values === null || typeof values !== 'object' || Array.isArray(values)) {
    throw new AppError(403, 'A valid resource access policy is required.')
  }
  for (const [key] of Object.entries(values)) {
    validateIdentifier(key, 'scope column')
    if (!allowedColumns.has(key) && key !== idColumn) {
      throw new AppError(403, 'The resource access policy contains an invalid column.')
    }
  }
  if (Object.keys(values).length === 0 && !allowUnscoped) {
    throw new AppError(403, 'An explicit resource scope is required.')
  }
  return values
}

function buildWhere(filters, values = []) {
  const clauses = []
  for (const [column, value] of Object.entries(filters)) {
    values.push(value)
    clauses.push(`${column} = $${values.length}`)
  }
  return { clauses, values }
}

function createCrudFactory({
  tableName,
  idColumn = 'id',
  columns = [],
  scope,
  allowUnscoped = false,
  operations = {},
  database = pool,
} = {}) {
  if (tableName) {
    validateTableName(tableName)
    validateIdentifier(idColumn, 'id column')
  }

  const allowedColumns = new Set(columns)
  for (const column of allowedColumns) validateIdentifier(column, 'column name')

  async function run(method, args, defaultOperation) {
    if (typeof operations[method] === 'function') {
      return operations[method](database, ...args)
    }
    if (!tableName) {
      throw new AppError(405, 'This operation is not configured for this resource.')
    }
    return defaultOperation(...args)
  }

  return {
    get: (...args) => run('get', args, async (req) => {
      const filters = getScope(scope, req, 'read', allowUnscoped, allowedColumns, idColumn)
      const { clauses, values } = buildWhere(filters)
      const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''
      return database.query(`SELECT * FROM ${tableName}${where}`, values)
    }),

    getOne: (...args) => run('getOne', args, async (req) => {
      const { id } = req.params
      validateId(id)
      const filters = {
        ...getScope(scope, req, 'read', allowUnscoped, allowedColumns, idColumn),
        [idColumn]: id,
      }
      const { clauses, values } = buildWhere(filters)
      return database.query(
        `SELECT * FROM ${tableName} WHERE ${clauses.join(' AND ')}`,
        values,
      )
    }),

    post: (...args) => run('post', args, async (req) => {
      const scopeValues = getScope(scope, req, 'create', allowUnscoped, allowedColumns, idColumn)
      const entries = getEntries(
        req.body,
        allowedColumns,
        new Set([...Object.keys(scopeValues), idColumn]),
      )
      const values = Object.fromEntries(entries)
      for (const [key, value] of Object.entries(scopeValues)) {
        if (!allowedColumns.has(key) || Object.hasOwn(values, key)) {
          throw new AppError(400, 'Invalid or restricted column!')
        }
        values[key] = value
      }

      const keys = Object.keys(values)
      const params = Object.values(values)
      const columnsSql = keys.join(', ')
      const placeholders = params.map((_, index) => `$${index + 1}`).join(', ')
      return database.query(
        `INSERT INTO ${tableName} (${columnsSql}) VALUES (${placeholders}) RETURNING *`,
        params,
      )
    }),

    put: (...args) => run('put', args, async (req) => {
      const { id } = req.params
      validateId(id)
      const scopeValues = getScope(scope, req, 'update', allowUnscoped, allowedColumns, idColumn)
      const entries = getEntries(
        req.body,
        allowedColumns,
        new Set([...Object.keys(scopeValues), idColumn]),
      )
      const filters = { ...scopeValues, [idColumn]: id }
      const values = entries.map(([, value]) => value)
      const updates = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ')
      const { clauses } = buildWhere(filters, values)
      return database.query(
        `UPDATE ${tableName} SET ${updates} WHERE ${clauses.join(' AND ')} RETURNING *`,
        values,
      )
    }),

    delete: (...args) => run('delete', args, async (req) => {
      const { id } = req.params
      validateId(id)
      const filters = {
        ...getScope(scope, req, 'delete', allowUnscoped, allowedColumns, idColumn),
        [idColumn]: id,
      }
      const { clauses, values } = buildWhere(filters)
      return database.query(
        `DELETE FROM ${tableName} WHERE ${clauses.join(' AND ')} RETURNING *`,
        values,
      )
    }),

    patch: (...args) => run('patch', args, async (req) => {
      const { id } = req.params
      validateId(id)
      const scopeValues = getScope(scope, req, 'update', allowUnscoped, allowedColumns, idColumn)
      const entries = getEntries(
        req.body,
        allowedColumns,
        new Set([...Object.keys(scopeValues), idColumn]),
      )
      const filters = { ...scopeValues, [idColumn]: id }
      const values = entries.map(([, value]) => value)
      const updates = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ')
      const { clauses } = buildWhere(filters, values)
      return database.query(
        `UPDATE ${tableName} SET ${updates} WHERE ${clauses.join(' AND ')} RETURNING *`,
        values,
      )
    }),
  }
}

module.exports = createCrudFactory

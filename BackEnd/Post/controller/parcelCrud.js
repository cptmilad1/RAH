const createCrudFactory = require('../../factory/crudFactory')
const { findParcelsForUser, findParcelForUser } = require('../repositories/parcelReadRepository')
const { createParcel, cancelParcel } = require('../repositories/parcelWriteRepository')
const { requiredText, validateCreatePayload } = require('../services/parcelValidation')

module.exports = createCrudFactory({
  operations: {
    get: (pool, req) => findParcelsForUser(req.user.userId, req.user.role, pool),
    getOne: (pool, req) => findParcelForUser(req.user.userId, req.params.trackingCode, pool),
    post: (pool, req) => createParcel(req.user.userId, validateCreatePayload(req.body), pool),
    delete: (pool, req) => cancelParcel(
      req.user.userId,
      req.user.role,
      req.params.trackingCode,
      requiredText(req.body?.reason, 'دلیل لغو', 500),
      pool,
    ),
  },
})

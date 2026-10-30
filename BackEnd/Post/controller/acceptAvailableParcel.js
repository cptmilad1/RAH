const { acceptAvailableParcel } = require('../repositories/driverParcelRepository')
const userRoom = require('../../presence/userRoom')

async function acceptAvailableParcelHandler(req, res, next) {
  try {
    const result = await acceptAvailableParcel(req.user.userId, req.params.trackingCode)
    const io = req.app.get('io')
    const { participantIds, ...publicResult } = result
    io?.to(`parcel:${result.id}`).emit('parcel:updated', publicResult)
    participantIds.forEach((participantId) => {
      io?.to(userRoom(participantId)).emit('parcel:updated', publicResult)
    })
    io?.emit('driver:parcels:changed')
    return res.status(200).json({ message: 'مرسوله به شما واگذار شد.', data: publicResult })
  } catch (error) {
    return next(error)
  }
}

module.exports = acceptAvailableParcelHandler
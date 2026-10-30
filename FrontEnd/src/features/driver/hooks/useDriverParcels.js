import { useDeferredValue, useEffect, useMemo } from 'react'
import { useDriverParcelsStore } from '../driverParcelsStore'
import { usePresenceStore } from '../../presence/presenceStore'

export function useDriverParcels(search) {
  const parcels = useDriverParcelsStore((state) => state.parcels)
  const province = useDriverParcelsStore((state) => state.province)
  const loading = useDriverParcelsStore((state) => state.loading)
  const acceptingCode = useDriverParcelsStore((state) => state.acceptingCode)
  const error = useDriverParcelsStore((state) => state.error)
  const notice = useDriverParcelsStore((state) => state.notice)
  const fetchParcels = useDriverParcelsStore((state) => state.fetchParcels)
  const socket = usePresenceStore((state) => state.socket)
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase())

  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  useEffect(() => {
    if (!socket) return undefined
    socket.on('driver:parcels:changed', fetchParcels)
    return () => socket.off('driver:parcels:changed', fetchParcels)
  }, [fetchParcels, socket])

  const filteredParcels = useMemo(() => parcels.filter((parcel) => {
    const searchable = `${parcel.trackingCode} ${parcel.senderName || ''} ${parcel.pickupProvince || ''} ${parcel.deliveryProvince || ''}`.toLocaleLowerCase()
    return searchable.includes(deferredSearch)
  }), [deferredSearch, parcels])

  return { parcels: filteredParcels, province, loading, acceptingCode, error, notice, fetchParcels }
}
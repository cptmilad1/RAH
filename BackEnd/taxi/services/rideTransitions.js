const transitions = {
  requested: ['accepted', 'cancelled'],
  accepted: ['driver_arriving', 'cancelled'],
  driver_arriving: ['driver_arrived', 'cancelled'],
  driver_arrived: ['started', 'cancelled'],
  started: ['completed'],
  completed: [],
  cancelled: [],
}

function canTransition(currentStatus, nextStatus) {
  return transitions[currentStatus]?.includes(nextStatus) || false
}

module.exports = { canTransition, transitions }
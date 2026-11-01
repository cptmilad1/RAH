function DriverDetails(user, dateFormatter) {
    const driverDetails = [
        ['ولایت کاری', (user) => user.driverProvince || '—'],
        ['جواز رانندگی', (user) => user.licenseNumber || '—'],
        ['اعتبار جواز', (user) => user.licenseExpiry ? dateFormatter.format(new Date(user.licenseExpiry)) : '—'],
        ['موتر', (user) => [user.vehicleMake, user.vehicleModel, user.vehicleYear, user.vehicleColor].filter(Boolean).join(' · ') || '—'],
        ['نمبر پلیت', (user) => user.plateNumber || '—'],
    ]
    return driverDetails;
}
export default DriverDetails
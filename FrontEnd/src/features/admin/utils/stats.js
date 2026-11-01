function Stats(users){
      const stats = [
    { label: 'همهٔ حساب‌ها', value: users.length, icon: '◉', tone: 'bg-[#f0f4eb] text-[#547460]' },
    { label: 'درخواست‌های بررسی‌نشده', value: users.filter((user) => user.driverStatus === 'pending').length, icon: '◷', tone: 'bg-[#fbf6df] text-[#897c3e]' },
    { label: 'رانندگان تأییدشده', value: users.filter((user) => user.role === 'driver' && user.driverStatus === 'approved').length, icon: '⇢', tone: 'bg-[#eaf5e5] text-[#4c8046]' },
    { label: 'مدیران', value: users.filter((user) => user.role === 'admin').length, icon: '⚙', tone: 'bg-[#edf0fb] text-[#5b6594]' },
  ]
  return stats;
}
export default Stats
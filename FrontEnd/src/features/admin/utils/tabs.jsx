function TabsUtil(users){
    const tabs = [
        { id: 'all', label: 'همه', count: (users) => users.length },
        { id: 'pending', label: 'درخواست‌های رانندگی', count: (users) => users.filter((user) => user.driverStatus === 'pending').length },
        { id: 'drivers', label: 'رانندگان', count: (users) => users.filter((user) => user.role === 'driver').length },
        { id: 'users', label: 'کاربران عادی', count: (users) => users.filter((user) => user.role === 'user' && !user.driverStatus).length },
        { id: 'admins', label: 'مدیران', count: (users) => users.filter((user) => user.role === 'admin').length },
        { id: 'rejected', label: 'درخواست‌های ردشده', count: (users) => users.filter((user) => user.driverStatus === 'rejected').length },
        { id: 'inactive', label: 'حساب‌های غیرفعال', count: (users) => users.filter((user) => !user.isActive).length },
    ]
    return tabs;
}
export default TabsUtil;
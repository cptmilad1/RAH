const navBarItems = (user, unreadDirectMessages, logout) => {
  const navItems = [
    { label: 'داشبورد', icon: '⌂', to: '/dashboard' },
    { label: 'صندوق ورودی', icon: '✉', to: '/inbox', unread: unreadDirectMessages > 0 },
    { label: 'پیام‌های خصوصی', icon: '●', to: '/messages', unread: unreadDirectMessages > 0 },
    { label: 'درباره', icon: '؟', to: '/about' },
    ...(user?.role === 'user' ? [{ label: 'درخواست رانندگی', icon: '＋', to: '/driver-application' }] : []),
    { label: 'حساب کاربری', icon: '◉', to: `/profile/${user?.id}` },
    { label: 'خروج', icon: '↪', onClick: logout }
  ]
  return navItems
}

export default navBarItems
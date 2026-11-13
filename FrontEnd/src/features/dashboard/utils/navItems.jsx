import {
  IoAddCircleOutline,
  IoChatbubblesOutline,
  IoHelpCircleOutline,
  IoHomeOutline,
  IoLogOutOutline,
  IoMailOutline,
  IoPersonCircleOutline,
} from 'react-icons/io5'

const navBarItems = (user, unreadDirectMessages, logout) => {
  const navItems = [
    { label: 'داشبورد', icon: IoHomeOutline, to: '/dashboard' },
    { label: 'صندوق ورودی', icon: IoMailOutline, to: '/inbox', unread: unreadDirectMessages > 0 },
    { label: 'پیام‌های خصوصی', icon: IoChatbubblesOutline, to: '/messages', unread: unreadDirectMessages > 0 },
    { label: 'درباره', icon: IoHelpCircleOutline, to: '/about' },
    ...(user?.role === 'user' ? [{ label: 'درخواست رانندگی', icon: IoAddCircleOutline, to: '/driver-application' }] : []),
    { label: 'حساب کاربری', icon: IoPersonCircleOutline, to: `/profile/${user?.id}` },
    { label: 'خروج', icon: IoLogOutOutline, onClick: logout }
  ]
  return navItems
}

export default navBarItems
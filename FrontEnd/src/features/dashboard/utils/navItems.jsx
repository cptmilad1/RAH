import { usePresenceStore } from '../../presence/presenceStore'

const navBarItems = (user, navigate)=>{
  const unreadDirectMessages = usePresenceStore((state) => state.unreadDirectMessages)
    const navItems = [
    { label: 'نمای کلی', icon: '⌂', active: true },
    { label: 'صندوق ورودی', icon: '✉', to: '/inbox', unread: unreadDirectMessages > 0 },
    { label: 'پیام‌های خصوصی', icon: '●', to: '/messages', unread: unreadDirectMessages > 0 },
    ...(user?.role === 'user' ? [{ label: 'درخواست رانندگی', icon: '＋', to: '/driver-application' }] : []),
    { label: 'حساب کاربری', icon: '◉', to: `/profile/${user?.id}` },
  ]
  return navItems
}
export default navBarItems
function Statistics(user, roleLabel) {
    const stats = [
    {
      label: 'وضعیت حساب',
      icon: '✓',
      variant: 'account',
      value: user?.verify ? 'تأییدشده' : 'در انتظار تأیید',
      caption: user?.verify ? 'حساب شما آمادهٔ استفاده است' : 'برای فعال‌سازی، ایمیل خود را بررسی کنید',
    },
    { label: 'نوع حساب', icon: '✦', variant: 'white', value: roleLabel, caption: 'عضو خانوادهٔ راه' },
    { label: 'ایمیل شما', icon: '✉', variant: 'white', value: user?.email || '—', valueClassName: 'font-[Arial,sans-serif] text-[14px]', caption: 'راه ارتباطی حساب کاربری' },
  ]
    return stats
}
export default Statistics
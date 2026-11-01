import { FaToggleOff } from "react-icons/fa6";
import { FaToggleOn } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { SiAdblock } from "react-icons/si";

function getUserActions({ user, updating, isCurrentUser, onSetRole, onApprove, onReject, onSetActive }) {
  const pending = user.driverStatus === 'pending'
  const activeMessage = user.isActive
    ? `حساب «${user.fullName}» غیرفعال شود؟ نشست‌های فعال او نیز بسته می‌شوند.`
    : `حساب «${user.fullName}» فعال شود؟`
  return [
    pending && { label: updating ? 'در حال ثبت…' : 'تأیید راننده', onClick: () => onApprove(user.id), className: 'bg-[#174c3c] text-white' },
    pending && { label: 'رد درخواست', onClick: () => window.confirm(`درخواست رانندگی «${user.fullName}» رد شود؟`) && onReject(user.id), className: 'border border-[#f0d7d0] bg-white text-[#a94f3d]' },
    !pending && user.role === 'user' && { label: <GrUserAdmin />, onClick: () => onSetRole(user.id, 'admin'), className: 'border border-[#d6e5dc] bg-white text-[#315946]'},
    !pending && user.role === 'admin' && !isCurrentUser && { label: <SiAdblock />, onClick: () => onSetRole(user.id, 'user'), className: 'border border-[#f0d7d0] bg-white text-[#a94f3d]' },
    !isCurrentUser && {
      label: user.isActive ? <FaToggleOn /> : <FaToggleOff />,
      onClick: () => window.confirm(activeMessage) && onSetActive(user.id, !user.isActive),
      className: user.isActive ? 'border border-[#d5e8ce] bg-[#f3f8ed] text-[#416d43]' : 'border border-[#f0d7d0] bg-white text-[#a94f3d]',
    },
  ].filter(Boolean).map((action) => ({ ...action, disabled: updating }))
}
export default getUserActions
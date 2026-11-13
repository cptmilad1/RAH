import i18n from '../../settings/locals/i18n.js'
import { MdOutlineTextsms } from "react-icons/md";
import { Link } from 'react-router-dom'
import { blockUser, unblockUser } from '../api/profileApi'
import { ImBlocked } from "react-icons/im";
import { FaUserCheck } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from '../../../global/toast/toastStore'

function ProfileDetails({ users, roleLabel, isOnline, isOwnProfile, blockState, setBlockState, id, currentUser }) {
    const canEdit = String(currentUser?.id) === String(id) || currentUser?.role === 'admin'
    const nameRef = useRef(null)
    const profileRef = useRef(null)
    async function toggleBlock() {
        setBlockState((state) => ({ ...state, saving: true, error: '' }))
        try {
            const result = blockState.blockedByMe ? await unblockUser(id) : await blockUser(id)
            setBlockState((state) => ({ ...state, blockedByMe: result.blockedByMe, saving: false }))
            toast.success(result.blockedByMe ? 'toast.userBlocked' : 'toast.userUnblocked')
        } catch (error) {
            setBlockState((state) => ({ ...state, saving: false, error: error.message || 'تغییر وضعیت مسدودسازی ناموفق بود.' }))
        }
    }
    useEffect(()=>{
        const context = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            tl.fromTo(profileRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65 })
            .fromTo('[data-btns-profile]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.25')
            .fromTo('[data-img-profile]', { scale: 0, y: 18 }, { scale: 1, y: 0, duration: 0.7 }, '-=0.25')
        }, profileRef)
        return () => context.revert()
    }, [profileRef])
    return (
        <section ref={profileRef} data-profile-hero className="relative isolate overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_12%_100%,rgba(215,243,106,0.13),transparent_31%),linear-gradient(125deg,#123e32,#1c5942)] px-5 py-7 text-white sm:px-9 sm:py-9">
            <div aria-hidden="true" className="pointer-events-none absolute -left-14 -top-20 -z-10 size-64 rounded-full border border-white/[0.08] shadow-[0_0_0_26px_rgba(255,255,255,0.025),0_0_0_52px_rgba(255,255,255,0.02)]" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-6">
                    <img data-img-profile src={users?.image || '/imgs/default-avatar.svg'} alt={i18n.t('ProfileImageAlt {{name}}', { name: users?.name || 'کاربر' })} className="size-[82px] shrink-0 rounded-[22px] border border-white/20 bg-white/10 object-cover p-1 shadow-[0_12px_30px_rgba(5,33,24,0.22)] sm:size-[102px] sm:rounded-[26px]" />
                    <div className="min-w-0 flex-1 flex flex-col items-start gap-1.5 sm:gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#d7f36a]/20 bg-[#d7f36a]/[0.1] px-3.5 py-2 text-[11px] font-bold text-[#e5f2bd]">
                            {i18n.t(roleLabel)}
                            <span
                                className={`size-1.5 rounded-full ${isOnline ? 'bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.16)]' : 'bg-[#8b5e3c] shadow-[0_0_0_3px_rgba(139,94,60,0.2)]'}`}
                                aria-label={i18n.t(isOnline ? 'آنلاین' : 'آفلاین')}
                            />
                        </span>
                        <h1 ref={nameRef} className="m-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[25px] font-extrabold text-[#f4f7ef] sm:text-[32px]">{users?.name || i18n.t('کاربر راه')}</h1>
                        <p className="mt-1.5 text-xs text-[#c0d4c7]">{i18n.t("اطلاعات حساب و راه‌های ارتباطی")}</p>
                    </div>
                </div>
                {!isOwnProfile && (
                    <div data-btns-profile className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                        <Link
                            to={`/messages/${id}`}
                            aria-label={i18n.t('ارسال پیام')}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-xs font-bold text-[#f4f7ef] transition hover:-translate-y-0.5 hover:border-[#d7f36a]/40 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f36a]"
                        >
                            <MdOutlineTextsms className="text-base text-[#d7f36a]" />
                            {i18n.t('پیام')}
                        </Link>
                        <button
                            type="button"
                            onClick={toggleBlock}
                            disabled={blockState.loading || blockState.saving}
                            aria-label={i18n.t(blockState.blockedByMe ? 'رفع مسدودی کاربر' : 'مسدود کردن کاربر')}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-xs font-bold text-[#f4f7ef] transition hover:-translate-y-0.5 hover:border-[#d7f36a]/40 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f36a] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {blockState.saving ? 'در حال ثبت…' : blockState.blockedByMe ? <FaUserCheck className="text-base text-[#d7f36a]" /> : <ImBlocked className="text-sm text-[#e5b3a5]" />}
                            {i18n.t(blockState.blockedByMe ? 'رفع مسدودی' : 'مسدود کردن')}
                        </button>
                    </div>
                )}
                {canEdit && (
                    <Link
                        to={`/profile/${id}/edit`}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#d7f36a] px-4 text-xs font-extrabold text-[#17352e] shadow-[0_8px_20px_rgba(9,31,20,0.16)] transition hover:-translate-y-0.5 hover:bg-[#e2f88c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f36a] sm:w-auto"
                    >
                        <MdEdit className="text-lg" />{i18n.t("ویرایش پروفایل")}
                    </Link>
                )}
            </div>
            {blockState.error && <p role="alert" className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-xs text-[#ffe0d6]">{i18n.t(blockState.error)}</p>}
        </section>
    )
}
export default ProfileDetails
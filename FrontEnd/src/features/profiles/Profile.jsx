import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useParams } from 'react-router-dom'
import useProfile from './hooks/UseProfile'
import roleChecker from './utils/roleChecker'
import { useAuthStore } from '../auth/authStore'
import { getUserBlockStatus } from './api/profileApi'
import HeaderBackward from '../global/backwardBtn'
import ProfileInfoCards from './components/profileInfoCards'
import ProfileDetails from './components/ProfileDetails'



function Profile() {
  const { id } = useParams()
  const users = useProfile((state) => state.users)
  const setUsers = useProfile((state) => state.setUsers)
  const currentUser = useAuthStore((state) => state.user)
  const profileRef = useRef(null)
  const isOwnProfile = String(currentUser?.id) === String(id)
  const [blockState, setBlockState] = useState({ loading: true, blockedByMe: false, blockedMe: false, error: '', saving: false })

  useEffect(() => {
    setUsers(id).catch(() => undefined)
  }, [id, setUsers])

  useEffect(() => {
    let active = true
    if (isOwnProfile) {
      setBlockState((state) => ({ ...state, loading: false }))
      return undefined
    }
    getUserBlockStatus(id)
      .then((status) => {
        if (active) setBlockState({ ...status, loading: false, error: '', saving: false })
      })
      .catch((error) => {
        if (active) setBlockState((state) => ({ ...state, loading: false, error: error.message || 'وضعیت مسدودسازی دریافت نشد.' }))
      })
    return () => { active = false }
  }, [id, isOwnProfile])

  useEffect(() => {
    const root = profileRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('[data-profile-hero]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('[data-profile-card]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.25')
    }, root)

    return () => context.revert()
  }, [])

  const roleLabel = roleChecker(users?.role)

  

  return (
    <main ref={profileRef} className="min-h-screen bg-[radial-gradient(ellipse_at_76%_-12%,rgba(215,243,106,0.18),transparent_34%),#f6f7f2] px-4 py-5 text-[#17352e] sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-[1080px]">
        <HeaderBackward />
        <ProfileDetails
          users={users}
          roleLabel={roleLabel}
          isOwnProfile={isOwnProfile}
          blockState={blockState}
          setBlockState={setBlockState}
          id={id}
          currentUser={currentUser}
        />
        <ProfileInfoCards users={users} roleLabel={roleLabel} />
      </div>
    </main>
  )
}

export default Profile
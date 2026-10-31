import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useAuth } from '../auth/authStore'
import { usePresenceStore } from '../presence/presenceStore'
import { useNavigate } from 'react-router-dom'
import { getUnreadDirectMessageCount } from '../messages/messagesApi'
import navBarItems from './utils/navItems'
import NavbarSide from './components/NavbarSide'
import HeaderAndProfile from './components/headerAndPRofile'
import PostCards from './components/taxi&postCarts'
import DetailsCard from './components/detailsCard'
import InfoCard from './components/infoCard'
import UserInfo from './components/userInfoCard'

const roleLabels = { user: 'کاربر', admin: 'مدیر', driver: 'راننده' }


function Dashboard() {
  const { user, logout } = useAuth()
  const isOnline = usePresenceStore((state) => Boolean(user?.id && state.onlineUsers[String(user.id)]))
  const setUnreadDirectMessages = usePresenceStore((state) => state.setUnreadDirectMessages)
  const dashboardRef = useRef(null)
  const navigate = useNavigate()
  const roleLabel = roleLabels[user?.role] || 'کاربر'
  const navItems = navBarItems(user, navigate)
 
  
  

  //gsap animations and event listeners
  useEffect(() => {
    let handlers = []
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
      entrance
        .fromTo('[data-dashboard-stat]', { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12 }, '-=0.28')
      const cards = gsap.utils.toArray('[data-dashboard-stat]')
      handlers = cards.map((card) => {
        const onMove = (event) => {
          const bounds = card.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width - 0.5
          const y = (event.clientY - bounds.top) / bounds.height - 0.5
          gsap.to(card, { rotateY: x * 3, rotateX: y * -3, y: -4, duration: 0.35, ease: 'power2.out', transformPerspective: 700 })
        }
        const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.55)' })
        card.addEventListener('pointermove', onMove)
        card.addEventListener('pointerleave', onLeave)
        return () => {
          card.removeEventListener('pointermove', onMove)
          card.removeEventListener('pointerleave', onLeave)
        }
      })
      gsap.to('[data-journey-glow]', { scale: 1.15, opacity: 0.8, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
    }, dashboardRef)

    return () => {
      context.revert()
      handlers.forEach((cleanup) => cleanup())
    }
  }, [])

  //fetch unread direct message
  useEffect(() => {
    let active = true
    getUnreadDirectMessageCount()
      .then((count) => {
        if (active) setUnreadDirectMessages(count)
      })
      .catch((error) => {
        console.error('Unread direct message count could not be loaded:', error.message)
      })
    return () => { active = false }
  }, [setUnreadDirectMessages, user?.id])
  return (
    <main ref={dashboardRef} className="grid min-h-screen grid-cols-1 bg-[radial-gradient(ellipse_at_72%_-10%,rgba(215,243,106,0.16),transparent_38%),#f6f7f2] text-[#17352e] lg:grid-cols-[286px_minmax(0,1fr)]">
      <NavbarSide navItems={navItems} logout={logout}/>

      <section className="mx-auto w-full min-w-0 max-w-[1320px] px-[18px] pt-[29px] pb-[38px] sm:px-[30px] sm:py-10 lg:px-[clamp(28px,5vw,76px)] lg:pt-[54px] lg:pb-[60px]">
        <HeaderAndProfile navigate={navigate} user={user} isOnline={isOnline} roleLabel={roleLabel}/>
        <PostCards user={user} navigate={navigate}/>
        <DetailsCard user={user} roleLabel={roleLabel}/>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.85fr)]">
          <UserInfo user={user}/>
          <InfoCard/>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
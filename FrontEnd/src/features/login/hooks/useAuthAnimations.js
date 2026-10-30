import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function useAuthAnimations(message) {
  const rootRef = useRef(null)
  const heroRef = useRef(null)
  const formRef = useRef(null)
  const statusRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
      entrance
        .fromTo('[data-hero-item]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.14 })
        .fromTo(formRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15)
        .fromTo('[data-route-orbit]', { opacity: 0, scale: 0.82, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: 1.1, stagger: 0.12 }, 0.35)
        .fromTo('[data-route-path]', { strokeDashoffset: 380 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0.55)

      gsap.to('[data-route-float]', {
        y: -8,
        duration: 2.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.28,
      })
    }, root)

    return () => context.revert()
  }, [])

  useEffect(() => {
    if (!message || !statusRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo(
        statusRef.current,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.5)' },
      )
    }, rootRef)

    return () => context.revert()
  }, [message])

  return { rootRef, heroRef, formRef, statusRef }
}

export default useAuthAnimations

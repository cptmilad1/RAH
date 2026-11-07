import i18n from '../../settings/locals/i18n.js'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

const stories = [
  {
    number: '01',
    eyebrow: 'اعتماد، از اولین قدم',
    title: 'امنیت، سپرِ آرامش شما',
    description: 'اطلاعات حساب و دسترسی‌ها با دقت مدیریت می‌شوند تا با خیال آسوده‌تر روی مسیر مرسوله‌تان تمرکز کنید.',
    visual: 'shield',
    background: '#123d32',
    foreground: '#f5f8ee',
    accent: '#d7f36a',
    muted: '#c0d3c7',
    kicker: '#d7f36a',
  },
  {
    number: '02',
    eyebrow: 'یک مسیر، بدون حدس و گمان',
    title: 'مرسوله‌ات را گم نکن',
    description: 'کد پیگیری و جزئیات مرسوله کمک می‌کند همیشه بدانی چه چیزی را دنبال می‌کنی و قدم بعدی کجاست.',
    visual: 'parcel',
    background: '#e9f0e2',
    foreground: '#193d30',
    accent: '#5d873b',
    muted: '#617469',
    kicker: '#6f9346',
  },
  {
    number: '03',
    eyebrow: 'آدم‌ها، نزدیک‌تر از همیشه',
    title: 'حرف‌ها به مقصد می‌رسند',
    description: 'گفت‌وگوهای مرسوله و پیام‌های خصوصی، راه ارتباط میان افراد درگیر ارسال را ساده‌تر می‌کنند.',
    visual: 'chat',
    background: '#d8eee4',
    foreground: '#173e34',
    accent: '#36866a',
    muted: '#537267',
    kicker: '#43886d',
  },
  {
    number: '04',
    eyebrow: 'برای کسانی که راه را بلدند',
    title: 'راننده؛ شریک مسیر',
    description: 'اگر راننده هستی، درخواست همکاری بده و فرصت‌های متناسب با مسیرت را از پنل خودت بررسی کن.',
    visual: 'driver',
    background: '#243c55',
    foreground: '#f3f6fa',
    accent: '#a7dbd1',
    muted: '#c1d0df',
    kicker: '#a7dbd1',
  },
  {
    number: '05',
    eyebrow: 'از تصمیم تا مقصد',
    title: 'شروعش از همین‌جاست',
    description: 'ثبت مرسوله و پیگیری آن را در یک مسیر منظم انجام بده؛ بدون پیچیدگی‌های اضافه.',
    visual: 'route',
    background: '#d7f36a',
    foreground: '#17352e',
    accent: '#315b42',
    muted: '#4e6856',
    kicker: '#42663f',
  },
]

const promotedPages = [
  { title: 'مدیریت مرسوله‌ها', description: 'ثبت کن، جزئیات را ببین و پیگیری را ادامه بده.', icon: '01', to: '/shipments', label: 'رفتن به مرسوله‌ها' },
  { title: 'صندوق ورودی', description: 'پیام‌های مربوط به مرسوله‌ها را یک‌جا دنبال کن.', icon: '02', to: '/inbox', label: 'دیدن صندوق ورودی' },
  { title: 'گفت‌وگوها', description: 'برای ارتباط مستقیم، گفت‌وگو را ادامه بده.', icon: '03', to: '/messages', label: 'رفتن به پیام‌ها' },
  { title: 'همکاری رانندگان', description: 'درخواست همکاری بده و وارد مسیر تازه‌ای شو.', icon: '04', to: '/driver-application', label: 'آشنایی با همکاری' },
]

function AboutPage() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const storyRef = useRef(null)
  const storyTrackRef = useRef(null)
  const storyCanvasRef = useRef(null)
  const storyProgressTrackRef = useRef(null)
  const storyProgressRef = useRef(null)
  const storyCounterRef = useRef(null)
  const storyHintRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer
    let animationFrame
    let scene

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25

      scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
      camera.position.set(0, 0, 6.4)

      scene.add(new THREE.AmbientLight(0xdfffe9, 2.3))
      const keyLight = new THREE.DirectionalLight(0xe4ff91, 4)
      keyLight.position.set(-3, 4, 5)
      scene.add(keyLight)
      const fillLight = new THREE.PointLight(0x55d6a1, 34, 12)
      fillLight.position.set(3, -1, 3)
      scene.add(fillLight)

      const parcel = new THREE.Group()
      scene.add(parcel)

      const carton = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 1.55, 1.35),
        [
          new THREE.MeshStandardMaterial({ color: 0x34795a, roughness: 0.38, metalness: 0.08 }),
          new THREE.MeshStandardMaterial({ color: 0x286748, roughness: 0.42, metalness: 0.06 }),
          new THREE.MeshStandardMaterial({ color: 0x8cad64, roughness: 0.48 }),
          new THREE.MeshStandardMaterial({ color: 0x275941, roughness: 0.5 }),
          new THREE.MeshStandardMaterial({ color: 0x1d4b39, roughness: 0.46 }),
          new THREE.MeshStandardMaterial({ color: 0x3c815d, roughness: 0.42 }),
        ],
      )
      parcel.add(carton)

      const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xd7f36a, roughness: 0.32, metalness: 0.08 })
      const ribbonTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.57, 1.37), ribbonMaterial)
      ribbonTop.position.x = -0.13
      parcel.add(ribbonTop)
      const ribbonSide = new THREE.Mesh(new THREE.BoxGeometry(1.67, 0.22, 1.37), ribbonMaterial)
      ribbonSide.position.y = 0.1
      parcel.add(ribbonSide)

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.67, 1.57, 1.37)),
        new THREE.LineBasicMaterial({ color: 0xdff5bf, transparent: true, opacity: 0.56 }),
      )
      parcel.add(edges)

      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(2.05, 0.008, 8, 160),
        new THREE.MeshBasicMaterial({ color: 0xc3ee7a, transparent: true, opacity: 0.43 }),
      )
      orbit.rotation.set(1.04, -0.2, 0.22)
      scene.add(orbit)

      const orbitAccent = new THREE.Mesh(
        new THREE.TorusGeometry(2.24, 0.006, 8, 160, Math.PI * 0.44),
        new THREE.MeshBasicMaterial({ color: 0x70d9aa, transparent: true, opacity: 0.78 }),
      )
      orbitAccent.rotation.set(0.62, 0.25, 1.14)
      scene.add(orbitAccent)

      const markerGeometry = new THREE.SphereGeometry(0.075, 18, 18)
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6ff9b,
        emissive: 0x7cae3f,
        emissiveIntensity: 1.3,
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.set(1.75, 0.68, 0.5)
      scene.add(marker)

      const dustGeometry = new THREE.BufferGeometry()
      const dustPositions = new Float32Array(54 * 3)
      for (let index = 0; index < dustPositions.length; index += 3) {
        dustPositions[index] = (Math.random() - 0.5) * 5.4
        dustPositions[index + 1] = (Math.random() - 0.5) * 4.6
        dustPositions[index + 2] = (Math.random() - 0.5) * 2.5 - 0.4
      }
      dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
      const dust = new THREE.Points(
        dustGeometry,
        new THREE.PointsMaterial({ color: 0xd3f39a, size: 0.025, transparent: true, opacity: 0.75 }),
      )
      scene.add(dust)

      const resize = () => {
        const { clientWidth, clientHeight } = canvas
        if (!clientWidth || !clientHeight) return
        camera.aspect = clientWidth / clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(clientWidth, clientHeight, false)
      }
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas)

      const clock = new THREE.Clock()
      const render = () => {
        const elapsed = clock.getElapsedTime()
        if (!reduceMotion) {
          parcel.rotation.y = Math.sin(elapsed * 0.34) * 0.18 + elapsed * 0.12
          parcel.rotation.x = Math.sin(elapsed * 0.42) * 0.07
          parcel.position.y = Math.sin(elapsed * 0.72) * 0.1
          orbit.rotation.z += 0.0007
          orbitAccent.rotation.z -= 0.0009
          dust.rotation.y = elapsed * 0.018
        }
        renderer.render(scene, camera)
        if (!reduceMotion) animationFrame = requestAnimationFrame(render)
      }
      render()

      const context = gsap.context(() => {
        if (reduceMotion) return
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro
          .fromTo('[data-about-nav]', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5 })
          .fromTo('[data-about-copy] > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.68, stagger: 0.11 }, '-=0.18')
          .fromTo('[data-about-art]', { opacity: 0, scale: 0.84, rotate: 4 }, { opacity: 1, scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.4)' }, '-=0.7')
          .fromTo('[data-about-stat]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 }, '-=0.52')

        gsap.fromTo('[data-about-cta]',
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: '[data-about-cta]', start: 'top 88%' },
          },
        )
        gsap.fromTo('[data-about-page-card]',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: '[data-about-pages]', start: 'top 84%' },
          },
        )
      }, root)

      return () => {
        context.revert()
        resizeObserver.disconnect()
        cancelAnimationFrame(animationFrame)
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            materials.forEach((material) => material.dispose())
          }
        })
        renderer.dispose()
      }
    } catch (error) {
      console.warn('About page 3D illustration could not be initialized:', error)
      renderer?.dispose()
    }

    return undefined
  }, [])

  useEffect(() => {
    const stage = storyRef.current
    const track = storyTrackRef.current
    const canvas = storyCanvasRef.current
    if (!stage || !track || !canvas) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer
    let frameId
    let scene

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15

      scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(33, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
      camera.position.set(0, 0, 7)
      scene.add(new THREE.AmbientLight(0xffffff, 2.2))
      const keyLight = new THREE.DirectionalLight(0xe4ffb2, 4)
      keyLight.position.set(-3, 4, 5)
      scene.add(keyLight)
      const rimLight = new THREE.PointLight(0x62d8bb, 24, 14)
      rimLight.position.set(3, -2, 3)
      scene.add(rimLight)

      const createMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.12,
        transparent: true,
        opacity: 0.96,
        ...options,
      })
      const createLineMaterial = (color, opacity = 0.8) => new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      })
      const groups = stories.map(() => {
        const group = new THREE.Group()
        group.visible = false
        scene.add(group)
        return group
      })

      const shieldShape = new THREE.Shape()
      shieldShape.moveTo(0, 1.25)
      shieldShape.lineTo(0.9, 0.9)
      shieldShape.lineTo(0.78, 0.1)
      shieldShape.quadraticCurveTo(0.62, -0.75, 0, -1.15)
      shieldShape.quadraticCurveTo(-0.62, -0.75, -0.78, 0.1)
      shieldShape.lineTo(-0.9, 0.9)
      shieldShape.closePath()
      const shield = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shieldShape, { depth: 0.24, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.08, bevelThickness: 0.07 }),
        createMaterial(0x91bd64, { metalness: 0.22, roughness: 0.25 }),
      )
      shield.position.z = -0.12
      groups[0].add(shield)
      const shieldMark = new THREE.Mesh(
        new THREE.TorusGeometry(0.37, 0.065, 12, 48, Math.PI * 1.5),
        createMaterial(0xe8ffb4, { emissive: 0x567d38, emissiveIntensity: 0.35 }),
      )
      shieldMark.rotation.z = Math.PI * 0.15
      shieldMark.position.set(0, -0.02, 0.2)
      groups[0].add(shieldMark)
      const shieldOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.012, 8, 120), createLineMaterial(0xd7f36a, 0.56))
      shieldOrbit.rotation.set(0.94, 0.2, 0.15)
      groups[0].add(shieldOrbit)

      const parcel = new THREE.Group()
      groups[1].add(parcel)
      parcel.add(new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 1.55, 1.35),
        [
          createMaterial(0x3e865d), createMaterial(0x347650), createMaterial(0x91b66a),
          createMaterial(0x28583e), createMaterial(0x25543c), createMaterial(0x438b61),
        ],
      ))
      const packageBand = new THREE.Mesh(new THREE.BoxGeometry(0.27, 1.58, 1.37), createMaterial(0xd7f36a, { roughness: 0.36 }))
      packageBand.position.x = -0.12
      parcel.add(packageBand)
      const packageTopBand = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.23, 1.38), createMaterial(0xd7f36a, { roughness: 0.36 }))
      packageTopBand.position.y = 0.12
      parcel.add(packageTopBand)
      parcel.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.72, 1.58, 1.38)),
        createLineMaterial(0xf0ffd4, 0.7),
      ))
      const packageOrbit = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.01, 8, 128), createLineMaterial(0x6a9c5e, 0.44))
      packageOrbit.rotation.set(0.95, 0.2, 0.4)
      groups[1].add(packageOrbit)

      const chatShape = new THREE.Shape()
      chatShape.moveTo(-0.9, 0.62)
      chatShape.quadraticCurveTo(-0.9, 0.82, -0.7, 0.82)
      chatShape.lineTo(0.65, 0.82)
      chatShape.quadraticCurveTo(0.9, 0.82, 0.9, 0.57)
      chatShape.lineTo(0.9, -0.28)
      chatShape.quadraticCurveTo(0.9, -0.5, 0.65, -0.5)
      chatShape.lineTo(-0.25, -0.5)
      chatShape.lineTo(-0.7, -0.9)
      chatShape.lineTo(-0.58, -0.5)
      chatShape.quadraticCurveTo(-0.9, -0.5, -0.9, -0.28)
      chatShape.closePath()
      const bubble = (group, x, y, z, scale, color) => {
        const mesh = new THREE.Mesh(
          new THREE.ExtrudeGeometry(chatShape, { depth: 0.16, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.035 }),
          createMaterial(color, { roughness: 0.25 }),
        )
        mesh.position.set(x, y, z)
        mesh.scale.setScalar(scale)
        group.add(mesh)
        return mesh
      }
      bubble(groups[2], -0.32, 0.34, 0, 0.85, 0x4d9b78)
      bubble(groups[2], 0.56, -0.38, 0.3, 0.58, 0xb5df7c)
      const messageDots = new THREE.Group()
      for (let index = 0; index < 3; index += 1) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), createMaterial(0xecffd4, { emissive: 0x557941, emissiveIntensity: 0.3 }))
        dot.position.set(-0.65 + index * 0.22, 0.18, 0.2)
        messageDots.add(dot)
      }
      groups[2].add(messageDots)
      const chatOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.011, 8, 128), createLineMaterial(0x3e8f72, 0.4))
      chatOrbit.rotation.set(0.8, 0.15, 0.4)
      groups[2].add(chatOrbit)

      const driver = new THREE.Group()
      groups[3].add(driver)
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.53, 0.85, 8, 20), createMaterial(0x8bcfc0, { roughness: 0.34 }))
      body.position.y = -0.38
      driver.add(body)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), createMaterial(0xf3d0a6, { roughness: 0.52 }))
      head.position.y = 0.78
      driver.add(head)
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.44, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), createMaterial(0xd7f36a, { roughness: 0.28 }))
      helmet.position.y = 0.88
      driver.add(helmet)
      const driverOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.012, 8, 128), createLineMaterial(0xa7dbd1, 0.62))
      driverOrbit.rotation.set(1.05, 0.3, 0.18)
      groups[3].add(driverOrbit)
      const driverNode = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), createMaterial(0xd7f36a, { emissive: 0x89b04c, emissiveIntensity: 0.8 }))
      driverNode.position.set(1.1, 0.94, 0.5)
      groups[3].add(driverNode)

      const routeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.75, -0.82, 0),
        new THREE.Vector3(-0.95, -0.18, 0.12),
        new THREE.Vector3(-0.15, -0.55, 0.1),
        new THREE.Vector3(0.5, 0.32, 0.2),
        new THREE.Vector3(1.62, 0.85, 0),
      ])
      const routeLine = new THREE.Mesh(
        new THREE.TubeGeometry(routeCurve, 96, 0.023, 8, false),
        createMaterial(0x356b45, { emissive: 0x294e34, emissiveIntensity: 0.25 }),
      )
      groups[4].add(routeLine)
      routeCurve.getPoints(4).forEach((point, index) => {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(index === 0 || index === 4 ? 0.16 : 0.09, 20, 20),
          createMaterial(index === 0 || index === 4 ? 0xf6ffe1 : 0x6e9a47, { emissive: 0x41622e, emissiveIntensity: 0.24 }),
        )
        node.position.copy(point)
        groups[4].add(node)
      })
      const routeRing = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.012, 8, 128), createLineMaterial(0x47754c, 0.43))
      routeRing.rotation.set(0.76, 0.2, -0.28)
      groups[4].add(routeRing)

      const dustGeometry = new THREE.BufferGeometry()
      const dustPositions = new Float32Array(60 * 3)
      for (let index = 0; index < dustPositions.length; index += 3) {
        dustPositions[index] = (Math.random() - 0.5) * 5.2
        dustPositions[index + 1] = (Math.random() - 0.5) * 4.2
        dustPositions[index + 2] = (Math.random() - 0.5) * 2
      }
      dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
      const dust = new THREE.Points(
        dustGeometry,
        new THREE.PointsMaterial({ color: 0xd7f36a, size: 0.024, transparent: true, opacity: 0.62 }),
      )
      scene.add(dust)
      const setStoryProgress = (progress) => {
        const storyPosition = progress * (stories.length - 1)
        const activeIndex = Math.min(Math.round(storyPosition), stories.length - 1)
        const lowerIndex = Math.floor(storyPosition)
        const upperIndex = Math.min(lowerIndex + 1, stories.length - 1)
        const colorMix = storyPosition - lowerIndex
        if (storyCounterRef.current) {
          storyCounterRef.current.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(stories.length).padStart(2, '0')}`
          storyCounterRef.current.style.color = stories[activeIndex].foreground
        }
        if (storyProgressRef.current) {
          storyProgressRef.current.style.width = `${Math.max(0, Math.min(progress, 1)) * 100}%`
          storyProgressRef.current.style.backgroundColor = stories[activeIndex].accent
        }
        if (storyProgressTrackRef.current) {
          storyProgressTrackRef.current.style.backgroundColor = `${stories[activeIndex].foreground}33`
        }
        if (storyHintRef.current) {
          storyHintRef.current.style.color = `${stories[activeIndex].foreground}99`
        }
        groups.forEach((group, index) => {
          group.visible = index === activeIndex
        })
        if (reduceMotion) {
          track.querySelectorAll('[data-story-panel]').forEach((panel, index) => {
            panel.style.backgroundColor = stories[index].background
          })
        } else {
          stage.style.backgroundColor = gsap.utils.interpolate(
            stories[lowerIndex].background,
            stories[upperIndex].background,
            colorMix,
          )
          track.querySelectorAll('[data-story-panel]').forEach((panel) => {
            panel.style.backgroundColor = 'transparent'
          })
        }
      }

      setStoryProgress(0)
      const resize = () => {
        const { clientWidth, clientHeight } = canvas
        if (!clientWidth || !clientHeight) return
        camera.aspect = clientWidth / clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(clientWidth, clientHeight, false)
      }
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas)

      const clock = new THREE.Clock()
      const render = () => {
        const elapsed = clock.getElapsedTime()
        groups.forEach((group, index) => {
          if (!group.visible) return
          group.rotation.y = Math.sin(elapsed * 0.35 + index) * 0.13 + elapsed * 0.08
          group.rotation.x = Math.sin(elapsed * 0.3 + index) * 0.045
          group.position.y = Math.sin(elapsed * 0.72 + index) * 0.08
        })
        dust.rotation.y = elapsed * 0.018
        renderer.render(scene, camera)
        if (!reduceMotion) frameId = requestAnimationFrame(render)
      }
      render()

      const context = gsap.context(() => {
        if (reduceMotion) return
        gsap.to(track, {
          x: () => window.innerWidth - track.scrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 1)}`,
            scrub: 0.85,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setStoryProgress(self.progress),
          },
        })
        ScrollTrigger.refresh()
      }, stage)

      return () => {
        context.revert()
        resizeObserver.disconnect()
        cancelAnimationFrame(frameId)
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            materials.forEach((material) => material.dispose())
          }
        })
        renderer.dispose()
      }
    } catch (error) {
      console.warn('About story 3D scene could not be initialized:', error)
      renderer?.dispose()
    }

    return undefined
  }, [])

  return (
    <main ref={rootRef} dir="rtl" className="min-h-screen overflow-x-clip bg-[#f7f8f2] text-[#17352e]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.24]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#9aa995 0.65px, transparent 0.65px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <nav data-about-nav className="flex items-center justify-between py-5 sm:py-7" aria-label={i18n.t("ناوبری درباره")}>
          <Link to="/dashboard" className="group inline-flex items-center gap-3 text-sm font-bold text-[#557365] no-underline transition hover:text-[#17352e]">
            <span className="grid size-10 place-items-center rounded-full border border-[#dfe8dc] bg-white transition group-hover:-translate-x-1" aria-hidden="true">←</span>{i18n.t("بازگشت به داشبورد")}</Link>
          <Link to="/dashboard" className="flex items-center gap-2.5 text-lg font-black text-[#17352e] no-underline">
            <span className="grid size-9 place-items-center rounded-xl bg-[#d7f36a] text-xl shadow-[0_8px_24px_rgba(80,115,49,.16)]">{i18n.t("ر")}</span>{i18n.t("راه")}</Link>
        </nav>

        <section className="relative grid min-h-[620px] items-center gap-4 pb-14 pt-7 sm:pt-12 lg:min-h-[690px] lg:grid-cols-[1fr_0.95fr] lg:gap-0 lg:pb-20 lg:pt-4">
          <div className="relative z-10 order-2 max-w-[640px] lg:order-1" data-about-copy>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce9cc] bg-white/80 px-3.5 py-2 text-[11px] font-bold text-[#55705c] shadow-sm backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#9bc34d] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#83ae3d]" />
              </span>{i18n.t("مسیر ارسال، روشن‌تر از همیشه")}</div>
            <h1 className="m-0 max-w-[650px] text-[clamp(2.8rem,6.6vw,6.4rem)] font-black leading-[1.14] tracking-[-0.065em] text-[#163a30]">{i18n.t("هر مسیر،")}<br />
              <span className="relative inline-block text-[#769a3e]">{i18n.t("یک قدم")}<svg className="absolute -bottom-2 right-0 h-3 w-full text-[#d7f36a]" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 8C79 1 199 1 297 7" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>{' '}{i18n.t("نزدیک‌تر.")}</h1>
            <p className="mt-7 max-w-[510px] text-sm leading-8 text-[#718078] sm:text-base sm:leading-9">{i18n.t("راه، تجربهٔ ارسال را از یک کار پراکنده به مسیری ساده و قابل پیگیری تبدیل می‌کند؛\n              از ثبت مرسوله تا رسیدن آن به مقصد، همه‌چیز شفاف و کنار شماست.")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/shipments" className="group inline-flex min-h-13 items-center gap-3 rounded-2xl bg-[#173f32] px-6 py-3.5 text-sm font-extrabold text-white no-underline shadow-[0_14px_30px_rgba(23,63,50,.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#225741] hover:shadow-[0_18px_38px_rgba(23,63,50,.25)]">{i18n.t("شروع تجربهٔ راه")}<span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
              </Link>
              <Link to="/driver-application" className="inline-flex min-h-13 items-center gap-2 rounded-2xl border border-[#dfe8dc] bg-white/80 px-5 py-3.5 text-sm font-bold text-[#456554] no-underline transition hover:border-[#b6ca9b] hover:bg-white">{i18n.t("همکاری با ما")}<span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-9 gap-y-5 border-t border-[#e4e9e0] pt-6">
              <div data-about-stat>
                <p className="m-0 text-2xl font-black tracking-tight text-[#234d3b]">{i18n.t("ساده")}</p>
                <p className="mb-0 mt-1 text-[11px] font-medium text-[#89968d]">{i18n.t("از ثبت تا پیگیری")}</p>
              </div>
              <div data-about-stat>
                <p className="m-0 text-2xl font-black tracking-tight text-[#234d3b]">{i18n.t("شفاف")}</p>
                <p className="mb-0 mt-1 text-[11px] font-medium text-[#89968d]">{i18n.t("در تمام مراحل مسیر")}</p>
              </div>
              <div data-about-stat>
                <p className="m-0 text-2xl font-black tracking-tight text-[#234d3b]">{i18n.t("همراه")}</p>
                <p className="mb-0 mt-1 text-[11px] font-medium text-[#89968d]">{i18n.t("برای همهٔ نقش‌ها")}</p>
              </div>
            </div>
          </div>

          <div data-about-art className="relative order-1 mx-auto aspect-square w-full max-w-[600px] lg:order-2 lg:-mr-10 lg:max-w-[700px]">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(179,213,128,.34),rgba(215,243,106,.08)_48%,transparent_72%)] blur-2xl" />
            <div className="absolute inset-[12%] rounded-full border border-[#c6d6bd]/55" />
            <div className="absolute inset-[19%] rounded-full border border-dashed border-[#b7c8b3]/60" />
            <div className="absolute right-[13%] top-[23%] z-10 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3.5 py-2.5 shadow-[0_14px_40px_rgba(32,66,48,.1)] backdrop-blur">
              <span className="grid size-8 place-items-center rounded-xl bg-[#eef5dd] text-sm text-[#61843e]" aria-hidden="true">✓</span>
              <span className="grid gap-0.5"><b className="text-[10px] text-[#365541]">{i18n.t("مسیر مشخص")}</b><small className="text-[9px] text-[#8a988e]">{i18n.t("از مبدأ تا مقصد")}</small></span>
            </div>
            <div className="absolute bottom-[18%] left-[5%] z-10 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3.5 py-2.5 shadow-[0_14px_40px_rgba(32,66,48,.1)] backdrop-blur">
              <span className="grid size-8 place-items-center rounded-xl bg-[#e6f4ee] text-sm text-[#3d8e6e]" aria-hidden="true">↗</span>
              <span className="grid gap-0.5"><b className="text-[10px] text-[#365541]">{i18n.t("ارتباط آسان")}</b><small className="text-[9px] text-[#8a988e]">{i18n.t("همراه در هر قدم")}</small></span>
            </div>
            <div className="absolute inset-0">
              <canvas ref={canvasRef} className="size-full" aria-label={i18n.t("تصویر سه‌بعدی یک مرسوله در مسیر ارسال")} role="img" />
            </div>
            <div className="absolute bottom-[9%] right-1/2 h-6 w-[45%] translate-x-1/2 rounded-[50%] bg-[#31513d]/15 blur-xl" />
            <span className="absolute left-[17%] top-[18%] size-2 rounded-full bg-[#a2c46b] shadow-[0_0_22px_5px_rgba(162,196,107,.32)]" />
            <span className="absolute bottom-[29%] right-[11%] size-1.5 rounded-full bg-[#71b99a] shadow-[0_0_20px_4px_rgba(113,185,154,.4)]" />
          </div>
        </section>

      </div>

      <section
        ref={storyRef}
        aria-label={i18n.t("داستان راه")}
        className="relative left-1/2 mt-5 h-[100svh] min-h-[650px] w-screen -translate-x-1/2 overflow-hidden bg-[#123d32] motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:overflow-visible"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7 lg:px-14" aria-hidden="true">
          <span className="rounded-full border border-white/15 bg-black/[0.08] px-3 py-1.5 text-[10px] font-bold text-white/70 backdrop-blur">{i18n.t("راه، در پنج قاب")}</span>
          <span ref={storyCounterRef} className="font-mono text-xs font-bold tracking-[0.18em] text-white/80">01 / 05</span>
        </div>
        <div ref={storyProgressTrackRef} className="pointer-events-none absolute inset-x-5 top-[58px] z-30 h-[2px] overflow-hidden rounded-full bg-white/20 sm:inset-x-9 sm:top-[72px] lg:inset-x-14">
          <span ref={storyProgressRef} className="ml-auto block h-full w-0 rounded-full bg-[#d7f36a]" />
        </div>

        <div className="pointer-events-none absolute inset-y-[10%] left-0 z-10 w-[65%] sm:w-[59%] motion-reduce:hidden">
          <canvas ref={storyCanvasRef} className="size-full" aria-label={i18n.t("نمایش‌های سه‌بعدی از امکانات راه")} role="img" />
        </div>
        <div ref={storyTrackRef} dir="ltr" className="relative z-20 flex h-full w-[500vw] motion-reduce:h-auto motion-reduce:w-full motion-reduce:flex-col motion-reduce:transform-none">
          {stories.map((story) => (
            <article
              key={story.number}
              data-story-panel
              dir="rtl"
              className="relative flex h-full w-screen shrink-0 items-center overflow-hidden px-6 pb-8 pt-20 sm:px-10 lg:px-16 motion-reduce:min-h-[82svh] motion-reduce:w-full motion-reduce:shrink"
              style={{ backgroundColor: 'transparent', color: story.foreground }}
            >
              <span className="pointer-events-none absolute bottom-[-0.2em] left-[-0.04em] select-none font-black leading-none tracking-[-0.09em] opacity-[0.045] text-[clamp(18rem,39vw,42rem)]" aria-hidden="true">
                {story.number}
              </span>
              <div className="relative z-20 ml-auto w-[72%] max-w-[650px] lg:w-[48%] motion-reduce:w-full motion-reduce:pt-[46svh]">
                <p className="mb-4 flex items-center gap-3 text-[11px] font-extrabold tracking-wide sm:text-xs" style={{ color: story.kicker }}>
                  <span className="h-px w-8" style={{ backgroundColor: story.accent }} />
                  {i18n.t(story.eyebrow)}
                </p>
                <h2 className="m-0 max-w-[650px] text-[clamp(2.5rem,5.5vw,5.5rem)] font-black leading-[1.14] tracking-[-0.06em]">
                  {i18n.t(story.title)}
                </h2>
                <p className="mb-0 mt-5 max-w-[510px] text-sm leading-8 sm:mt-7 sm:text-base sm:leading-9" style={{ color: story.muted }}>
                  {i18n.t(story.description)}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-current/20 px-3.5 py-2 text-[10px] font-bold opacity-80">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: story.accent }} />
                  {story.number} <span className="opacity-60">/</span> 05
                </div>
              </div>
            </article>
          ))}
        </div>
        <p ref={storyHintRef} className="pointer-events-none absolute bottom-5 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-semibold text-white/55 sm:flex motion-reduce:hidden">{i18n.t("برای ادامه، اسکرول کنید")}{' '}<span aria-hidden="true">↓</span>
        </p>
      </section>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <section data-about-cta className="relative my-8 overflow-hidden rounded-[30px] bg-[#163d31] px-6 py-8 text-white shadow-[0_24px_70px_rgba(22,61,49,.15)] sm:my-10 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -left-20 -top-32 size-80 rounded-full border border-white/[0.07] shadow-[0_0_0_35px_rgba(255,255,255,.025),0_0_0_70px_rgba(255,255,255,.02)]" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold text-[#d7f36a]">
                <span className="size-1.5 rounded-full bg-[#d7f36a]" />{i18n.t("مسیر بعدی از شما شروع می‌شود")}</span>
              <h2 className="mb-0 mt-4 text-2xl font-black tracking-tight sm:text-3xl">{i18n.t("آماده‌اید اولین قدم را بردارید؟")}</h2>
              <p className="mb-0 mt-2 text-xs leading-6 text-[#c2d4c9]">{i18n.t("مرسولهٔ تازه ثبت کنید یا به‌عنوان راننده به جمع همکاران راه بپیوندید.")}</p>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Link to="/shipments" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#d7f36a] px-5 text-xs font-extrabold text-[#17352e] no-underline transition hover:-translate-y-0.5 hover:bg-[#e2f78f] sm:flex-none">{i18n.t("ثبت مرسوله")}<span aria-hidden="true">←</span>
              </Link>
              <Link to="/driver-application" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-xs font-bold text-white no-underline transition hover:border-white/50 hover:bg-white/[0.07] sm:flex-none">{i18n.t("همکاری با راه")}<span aria-hidden="true">↗</span>
              </Link>
              <Link to="/messages" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-xs font-bold text-white no-underline transition hover:border-white/50 hover:bg-white/[0.07] sm:flex-none">{i18n.t("ارتباط و پیام‌ها")}<span aria-hidden="true">✉</span>
              </Link>
            </div>
          </div>
        </section>

        <section data-about-pages aria-labelledby="about-pages-heading" className="pb-8 pt-2 sm:pb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-extrabold tracking-wide text-[#86a34f]">{i18n.t("یک نگاه به راه")}</p>
              <h2 id="about-pages-heading" className="m-0 text-xl font-black text-[#1d4434] sm:text-2xl">{i18n.t("از کجا شروع کنیم؟")}</h2>
            </div>
            <span className="text-[10px] text-[#89968d]">{i18n.t("هر مسیر، یک قدم تا مقصد")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {promotedPages.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                data-about-page-card
                className="group flex min-h-[150px] flex-col rounded-[20px] border border-[#e5e9df] bg-white/80 p-4 text-inherit no-underline shadow-[0_10px_28px_rgba(37,69,46,.035)] transition duration-300 hover:-translate-y-1 hover:border-[#cbdab5] hover:bg-white hover:shadow-[0_18px_38px_rgba(37,69,46,.08)]"
              >
                <span className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#eff5e5] text-[10px] font-black text-[#678642] transition group-hover:bg-[#d7f36a]">{page.icon}</span>
                  <span className="text-xs text-[#8fa095] transition group-hover:-translate-x-1" aria-hidden="true">←</span>
                </span>
                <strong className="mb-1 mt-4 text-xs font-extrabold text-[#31513e]">{i18n.t(page.title)}</strong>
                <span className="text-[10px] leading-5 text-[#829087]">{i18n.t(page.description)}</span>
                <span className="mt-auto pt-3 text-[9px] font-bold text-[#64804e]">{i18n.t(page.label)}</span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e9e0] py-5 text-[10px] text-[#94a097]">
          <span>{i18n.t("راه؛ همراه شما در مسیر ارسال.")}</span>
          <Link to="/dashboard" className="font-bold text-[#607968] no-underline hover:text-[#17352e]">{i18n.t("رفتن به داشبورد ←")}</Link>
        </footer>
      </div>
    </main>
  )
}

export default AboutPage

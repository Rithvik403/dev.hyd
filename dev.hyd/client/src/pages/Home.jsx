import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { publicApi, authApi } from '../services/api'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'
import CostCalculator from '../components/CostCalculator'
import PortfolioSection from '../components/PortfolioSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ServicesMatrix from '../components/ServicesMatrix'
import QuickLeadWidget from '../components/QuickLeadWidget'

export default function Home() {
  // Preloader state
  const [showPreloader, setShowPreloader] = useState(true)

  // Navigation & Scroll states
  const [navOpen, setNavOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [scrollPercent, setScrollPercent] = useState(0)

  // Typewriter
  const typeWords = ['real', 'more', 'loyal', 'local']
  const [typeIdx, setTypeIdx] = useState(0)
  const [typeOpacity, setTypeOpacity] = useState(1)
  const [typeTransform, setTypeTransform] = useState('translateY(0)')

  // Dynamic state loaded from DB
  const [posts, setPosts] = useState([])
  const [services, setServices] = useState([
    {
      _id: '1',
      title: 'Business Website',
      description: 'Clean, fast business websites with services, photos, location, Google SEO optimization & WhatsApp booking button.',
      price: 'From ₹15,000',
      icon: 'blue'
    },
    {
      _id: '2',
      title: 'Custom Web Application',
      description: 'Interactive web software with database, user auth, API integrations & administrative dashboard.',
      price: 'From ₹35,000',
      icon: 'orange'
    },
    {
      _id: '3',
      title: 'E-Commerce Store',
      description: 'Online store with products catalog, shopping cart, instant Razorpay checkout & automated inventory.',
      price: 'From ₹28,000',
      icon: 'red'
    },
    {
      _id: '4',
      title: 'Mobile App (iOS / Android)',
      description: 'Cross-platform mobile apps, speed optimization, Core Web Vitals performance tuning & Google SEO.',
      price: 'From ₹45,000',
      icon: 'orange-light'
    }
  ])
  const [testimonials, setTestimonials] = useState([
    {
      _id: '1',
      name: 'Anjali Verma',
      business: 'Luxury Salon & Spa',
      location: 'Banjara Hills, Hyderabad',
      rating: 5,
      metric: '🚀 3x Monthly Bookings',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      text: 'Rithvik understood exactly what my business needed. The automated WhatsApp booking system he built helped our salon double our appointments within the first 2 weeks. Extremely professional and delivered right on time!'
    },
    {
      _id: '2',
      name: 'Karthik Reddy',
      business: 'Modern Bistro & Cafe',
      location: 'Jubilee Hills, Hyderabad',
      rating: 5,
      metric: '⚡ 100% Paperless QR Menu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      text: 'The digital QR ordering menu built by dev.hyd transformed our dining experience. Customers love the instant mobile loading speed, and we saved thousands on menu reprinting costs.'
    },
    {
      _id: '3',
      name: 'Neha Kapoor',
      business: 'Ethnic Wear Boutique',
      location: 'Gachibowli, Hyderabad',
      rating: 5,
      metric: '🛍️ ₹4.5L Sales Month 1',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      text: 'Super smooth e-commerce website with Razorpay payment gateway integration! Rithvik guided us through domain setup, product uploading, and Instagram shop integration. Highly recommended for any local retail business.'
    }
  ])
  const [galleryItems, setGalleryItems] = useState([
    {
      _id: '1',
      title: 'Luxury Salon & Spa Booking System',
      category: 'Web Apps',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      tags: ['React', 'Node.js', 'WhatsApp API', 'MongoDB'],
      metric: '🚀 3x Booking Increase',
      demoUrl: '#',
      description: 'Custom online appointment scheduling system with automated WhatsApp confirmation messages for clients.',
      client: 'Anjali Verma (Luxury Salon Owner)',
      impact: 'Automated 150+ monthly appointment bookings and eliminated phone call scheduling delays.'
    },
    {
      _id: '2',
      title: 'Fashion & Ethnic Wear E-Commerce',
      category: 'E-Commerce',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      tags: ['React', 'Razorpay', 'Tailwind', 'Express'],
      metric: '🛍️ ₹4.5L Sales Month 1',
      demoUrl: '#',
      description: 'High-converting boutique e-commerce web app with instant Razorpay checkout, product filters & inventory management.',
      client: 'Neha Kapoor (Boutique Owner)',
      impact: 'Launched online sales within 10 days, enabling delivery across India.'
    },
    {
      _id: '3',
      title: 'Modern Bistro Digital Menu & Ordering',
      category: 'Business Sites',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      tags: ['React', 'QR Code', 'Location API', 'Mobile-First'],
      metric: '⚡ 100% Mobile Optimized',
      demoUrl: '#',
      description: 'Mobile-first QR code digital menu & location finder for a popular cafe in Jubilee Hills, Hyderabad.',
      client: 'Karthik Reddy (Modern Bistro)',
      impact: 'Reduced menu printing costs to zero and improved customer table turn time by 20%.'
    },
    {
      _id: '4',
      title: 'SaaS Client Analytics Dashboard',
      category: 'Dashboards',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      tags: ['React', 'Recharts', 'REST API', 'Auth'],
      metric: '📊 Real-time Insights',
      demoUrl: '#',
      description: 'Custom administrative dashboard monitoring monthly revenue, user growth & automated report generation.',
      client: 'TechVentures Hyderabad',
      impact: 'Replaced manual Excel spreadsheets with automated live analytics for executive team.'
    }
  ])
  const [faqs, setFaqs] = useState([
    {
      _id: '1',
      question: 'How long will it take to build my website?',
      answer: 'For most basic business websites, I deliver a fully functional demo within 2 days. The final launch usually takes 5 to 7 days, depending on content availability and revisions.'
    },
    {
      _id: '2',
      question: 'Will I be able to edit my website?',
      answer: 'Yes! I build websites with simple editing options or client portals where you can update text, services, photos, and menus yourself without coding.'
    },
    {
      _id: '3',
      question: 'Do you provide domain and hosting?',
      answer: 'Yes, I can set up and manage high-speed hosting and domain registration (like .in or .com) for your business so you don\'t have to worry about the technical details.'
    },
    {
      _id: '4',
      question: 'Do you provide support after website launch?',
      answer: 'Absolutely! I offer support packages (with standard packages including 1-3 months of free support) to ensure your website runs smoothly and gets regular updates.'
    },
    {
      _id: '5',
      question: 'Can I see a demo before I pay?',
      answer: 'Yes. I believe in proving value upfront. I can build a basic initial concept demo for your business in 2 days before you make any payment.'
    }
  ])
  const [settings, setSettings] = useState({
    siteName: 'dev.hyd',
    socialLinks: {
      facebook: '',
      instagram: 'https://instagram.com',
      twitter: '',
      linkedin: '',
      github: '',
      whatsapp: 'https://wa.me/917780252258'
    }
  })

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null)
  const faqSectionRef = useRef(null)

  // Testimonials Carousel state
  const [tIndex, setTIndex] = useState(0)

  // Form State
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState('')
  const [budget, setBudget] = useState('Under ₹5,000')
  const [message, setMessage] = useState('')
  const [flash, setFlash] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => {
        setFlash(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [flash])

  // Auth User Quick Nav Links
  const [authState, setAuthState] = useState({ admin: null, client: null })

  // Refs for custom animations
  const marqueeTrackRef = useRef(null)
  const statsContainerRef = useRef(null)
  const checklistRef = useRef(null)
  const imageWrapperRef = useRef(null)
  const contactSecRef = useRef(null)

  // Stats values
  const [stats, setStats] = useState([
    { label: 'Projects Done', current: 0, target: 30, suffix: '+' },
    { label: 'Days to First Demo', current: 0, target: 2, suffix: '' },
    { label: 'Happy Clients', current: 0, target: 100, suffix: '%' },
    { label: 'Local Businesses', current: 0, target: 18, suffix: '+' }
  ])

  // 1. Fetch Dynamic Home Data & Auth State
  useEffect(() => {
    // Public home content
    publicApi.getHomeData()
      .then((res) => {
        const { posts: fetchedPosts, services: fetchedServices, testimonials: fetchedTestimonials, faqs: fetchedFaqs, galleryItems: fetchedGallery, settings: fetchedSettings } = res.data
        if (fetchedPosts) setPosts(fetchedPosts)
        if (fetchedServices && fetchedServices.length > 0) setServices(fetchedServices)
        if (fetchedTestimonials && fetchedTestimonials.length > 0) setTestimonials(fetchedTestimonials)
        if (fetchedFaqs && fetchedFaqs.length > 0) setFaqs(fetchedFaqs)
        if (fetchedGallery && fetchedGallery.length > 0) setGalleryItems(fetchedGallery)
        if (fetchedSettings) {
          setSettings(fetchedSettings)
          // Update SEO Title and Description
          if (fetchedSettings.seoTitle) document.title = fetchedSettings.seoTitle
        }
      })
      .catch((err) => console.error('Error fetching home page data:', err))

    // Fetch auth status for header
    authApi.getMe()
      .then(res => {
        setAuthState({ admin: res.data.admin, client: res.data.client })
      })
      .catch(() => {})
  }, [])

  // 2. Scroll listener for progress bar and sticky navbar
  useEffect(() => {
    let scrollTimeout
    const handleScroll = () => {
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout)
      scrollTimeout = requestAnimationFrame(() => {
        const sy = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const pct = docHeight > 0 ? (sy / docHeight) * 100 : 0
        setScrollPercent(pct)

        // Sticky Navbar
        if (sy > 80) {
          setNavScrolled(true)
        } else {
          setNavScrolled(false)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout)
    }
  }, [])

  // 3. Active Link tracking
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection('#' + entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -55% 0px' }
    )

    sections.forEach((sec) => observer.observe(sec))
    return () => sections.forEach((sec) => observer.unobserve(sec))
  }, [])

  // 4. Typewriter Word Cycle
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setTypeOpacity(0)
      setTypeTransform('translateY(6px)')

      setTimeout(() => {
        setTypeIdx((prev) => (prev + 1) % typeWords.length)
        // Fade in
        setTypeOpacity(1)
        setTypeTransform('translateY(0)')
      }, 130)
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  // 5. Global Scroll Reveal & checklist Observer
  useEffect(() => {
    const revealEls = document.querySelectorAll('[data-reveal]')
    
    // Setup reveal delay groups
    const parentMap = new Map()
    revealEls.forEach(el => {
      const parent = el.parentElement
      if (!parentMap.has(parent)) {
        parentMap.set(parent, [])
      }
      parentMap.get(parent).push(el)
    })
    parentMap.forEach(group => {
      if (group.length > 1) {
        group.forEach((el, index) => {
          el.style.setProperty('--reveal-delay', (index * 0.08) + 's')
        })
      }
    })

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            revealObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.13, rootMargin: '0px 0px -35px 0px' }
    )

    revealEls.forEach((el) => revealObserver.observe(el))

    // Checklist Observer
    const checklist = checklistRef.current
    let checklistObserver
    if (checklist) {
      checklistObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lis = entry.target.querySelectorAll('li')
            lis.forEach((li, i) => {
              li.style.setProperty('--i', i)
              li.classList.add('is-visible')
            })
            checklistObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.13 })
      checklistObserver.observe(checklist)
    }

    // Image Wrapper Observer
    const imgWrapper = imageWrapperRef.current
    let imgObserver
    if (imgWrapper) {
      imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            imgObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.13 })
      imgObserver.observe(imgWrapper)
    }

    // Contact Cards Stagger
    const contactSec = contactSecRef.current
    let contactObserver
    if (contactSec) {
      contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.contact-info-card')
            cards.forEach((card, index) => {
              card.style.setProperty('--i', index)
              card.classList.add('is-visible')
            })
            contactObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.13 })
      contactObserver.observe(contactSec)
    }

    return () => {
      revealEls.forEach((el) => revealObserver.unobserve(el))
      if (checklistObserver && checklist) checklistObserver.unobserve(checklist)
      if (imgObserver && imgWrapper) imgObserver.unobserve(imgWrapper)
      if (contactObserver && contactSec) contactObserver.unobserve(contactSec)
    }
  }, [services, testimonials, faqs, galleryItems]) // re-run observers when lists are populated from DB

  // 6. Stats Count-up Animation
  useEffect(() => {
    const statsContainer = statsContainerRef.current
    let observer
    if (statsContainer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const duration = 1800
            let startTime = null

            const animate = (timestamp) => {
              if (!startTime) startTime = timestamp
              const elapsed = timestamp - startTime
              const progress = Math.min(elapsed / duration, 1)
              const ease = 1 - Math.pow(1 - progress, 4) // easeOutQuart
              
              setStats(prevStats => 
                prevStats.map(stat => {
                  const current = Math.floor(ease * stat.target)
                  return { ...stat, current }
                })
              )

              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                setStats(prevStats =>
                  prevStats.map(stat => ({ ...stat, current: stat.target }))
                )
              }
            }

            requestAnimationFrame(animate)
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.5 })

      observer.observe(statsContainer)
    }

    return () => {
      if (observer && statsContainer) observer.unobserve(statsContainer)
    }
  }, [])

  // 7. Auto-advance Testimonials Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setTIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // 8. Worked With Marquee scroll
  const handleMarqueeScroll = (direction) => {
    if (marqueeTrackRef.current) {
      marqueeTrackRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      })
    }
  }

  // 9. Interactive Effects: 3D Tilt Glare, Service card hover, Magnetic buttons, FAQ spotlight
  const handleTiltMouseMove = (e, cardEl) => {
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardEl.style.transform = `perspective(750px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-5px)`

    const glare = cardEl.querySelector('.tilt-glare')
    if (glare) {
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100
      glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.18) 0%, transparent 65%)`
    }
  }

  const handleTiltMouseLeave = (cardEl) => {
    if (!cardEl) return
    cardEl.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
    cardEl.style.transform = ''
    setTimeout(() => {
      cardEl.style.transition = ''
    }, 550)
    const glare = cardEl.querySelector('.tilt-glare')
    if (glare) {
      glare.style.background = ''
    }
  }

  const handleServiceMouseMove = (e, cardEl) => {
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardEl.style.setProperty('--gx', `${x}px`)
    cardEl.style.setProperty('--gy', `${y}px`)
  }

  const handleMagneticMouseMove = (e, btnEl) => {
    if (!btnEl) return
    const rect = btnEl.getBoundingClientRect()
    const bx = rect.left + rect.width / 2
    const by = rect.top + rect.height / 2
    const dx = e.clientX - bx
    const dy = e.clientY - by
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 90) {
      const tx = dx * 0.32
      const ty = dy * 0.32
      btnEl.style.transform = `translate(${tx}px, ${ty}px)`
    } else {
      btnEl.style.transform = ''
    }
  }

  const handleMagneticMouseLeave = (btnEl) => {
    if (!btnEl) return
    btnEl.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    btnEl.style.transform = ''
    setTimeout(() => {
      btnEl.style.transition = ''
    }, 400)
  }

  const handleFaqMouseMove = (e) => {
    if (faqSectionRef.current) {
      const rect = faqSectionRef.current.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      faqSectionRef.current.style.setProperty('--sx', `${sx}px`)
      faqSectionRef.current.style.setProperty('--sy', `${sy}px`)
    }
  }

  // 10. Contact form submission & Direct Mail / WhatsApp actions
  const handleComposeEmail = (e) => {
    if (e) e.preventDefault()
    
    // Check if form is partially filled
    const hasFormData = name.trim() || phone.trim() || service
    
    let mailSubject = encodeURIComponent(`Website Enquiry for dev.hyd`)
    let mailBody = encodeURIComponent(`Hi Rithvik / dev.hyd,\n\nI would like to discuss a website project for my business.`)

    if (hasFormData) {
      const errors = {}
      if (!name.trim()) errors.name = 'Please enter your name'
      if (!phone.trim()) errors.phone = 'Please enter your phone or WhatsApp number'
      if (!service) errors.service = 'Please select a service'

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        toast.error('Please fill in your Name, Phone, and Service')
        return
      }

      setFormErrors({})

      // Submit to DB in background
      publicApi.submitEnquiry({ name, business, phone, email, service, budget, message }).catch(() => {})

      mailSubject = encodeURIComponent(`New Website Enquiry from ${name}${business ? ` (${business})` : ''}`)
      mailBody = encodeURIComponent(
`Hi Rithvik / dev.hyd,

I would like to discuss a project with you:

• Name: ${name}
• Business: ${business || 'N/A'}
• Phone / WhatsApp: ${phone}
• Email: ${email || 'N/A'}
• Service Needed: ${service}
• Budget Range: ${budget}
• Message / Notes: ${message || 'N/A'}

Looking forward to your response!`
      )
    }

    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=dev.hyd.official@gmail.com&su=${mailSubject}&body=${mailBody}`
    toast.success('Opening Gmail Web composer...')
    window.open(gmailWebUrl, '_blank')
  }

  const handleSendWhatsApp = (e) => {
    if (e) e.preventDefault()

    const errors = {}
    if (!name.trim()) errors.name = 'Please enter your name'
    if (!phone.trim()) errors.phone = 'Please enter your phone or WhatsApp number'
    if (!service) errors.service = 'Please select a service'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error('Please fill in your Name, Phone, and Service')
      return
    }

    setFormErrors({})

    // Submit to DB in background
    publicApi.submitEnquiry({ name, business, phone, email, service, budget, message }).catch(() => {})

    const waText = encodeURIComponent(
`Hi dev.hyd! 👋 I want to discuss a project:
• *Name*: ${name}
• *Business*: ${business || 'Local Business'}
• *Phone/WhatsApp*: ${phone}
• *Email*: ${email || 'N/A'}
• *Service*: ${service}
• *Budget*: ${budget}
• *Message*: ${message || 'N/A'}`
    )

    toast.success('Opening WhatsApp...')
    window.open(`https://wa.me/917780252258?text=${waText}`, '_blank')
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFlash(null)

    const errors = {}
    if (!name.trim()) errors.name = 'Please enter your name'
    if (!phone.trim()) errors.phone = 'Please enter your phone or WhatsApp number'
    if (!service) errors.service = 'Please select a service'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      const firstField = Object.keys(errors)[0]
      const el = document.getElementById(`c_${firstField}`)
      if (el) el.focus()
      return
    }

    setFormErrors({})
    setSubmitting(true)

    try {
      const response = await publicApi.submitEnquiry({ name, business, phone, email, service, budget, message })
      const data = response.data
      setFlash({ type: 'success', msg: data.msg })
      toast.success("🎉 Enquiry saved! Opening options...")
      
      // Clear form
      setName('')
      setBusiness('')
      setPhone('')
      setEmail('')
      setService('')
      setMessage('')
      setFormErrors({})
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit form. Please check connection.'
      setFlash({ type: 'error', msg: errorMsg })
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderServiceIcon = (iconName) => {
    switch (iconName) {
      case 'blue':
        return (
          <svg className="service-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )
      case 'orange':
        return (
          <svg className="service-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )
      case 'red':
        return (
          <svg className="service-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        )
      case 'orange-light':
        return (
          <svg className="service-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        )
      default:
        return (
          <svg className="service-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 8 12 12 16 16 12 12 8" />
          </svg>
        )
    }
  }

  return (
    <>
      {/* Website Entrance Preloader */}
      {showPreloader && <Preloader onFinish={() => setShowPreloader(false)} />}

      {/* Scroll Progress Bar */}
      <div id="scrollBar" style={{ width: `${scrollPercent}%` }}></div>

      {/* Navigation */}
      <nav className={`${navScrolled ? 'nav-scrolled' : ''} ${navOpen ? 'nav-open' : ''}`}>
        <Link to="/" className="logo">
          {settings.siteName ? settings.siteName.replace(/(\.hyd)+$/i, '') : 'dev'}
          <span>.</span>hyd
        </Link>
        <button 
          type="button" 
          id="navToggle" 
          aria-label="Toggle Navigation"
          onClick={() => setNavOpen(true)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-links">
          <button 
            type="button" 
            id="navClose" 
            aria-label="Close Navigation"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
          <a href="#services" className={activeSection === '#services' ? 'active-link' : ''} onClick={() => setNavOpen(false)}>Services</a>
          <a href="#pricing" className={activeSection === '#pricing' ? 'active-link' : ''} onClick={() => setNavOpen(false)}>Pricing</a>
          <a href="#work" className={activeSection === '#work' ? 'active-link' : ''} onClick={() => setNavOpen(false)}>Work</a>
          <a href="#latest-blog" className={activeSection === '#latest-blog' ? 'active-link' : ''} onClick={() => setNavOpen(false)}>Blog</a>
          <a href="#about" className={activeSection === '#about' ? 'active-link' : ''} onClick={() => setNavOpen(false)}>About</a>
          {authState.admin ? (
            <Link to="/admin" style={{ color: 'var(--accent)', fontWeight: 700 }}>⚡ Admin Panel</Link>
          ) : authState.client ? (
            <Link to="/client" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.84rem' }}>My Portal</Link>
          ) : (
            <Link to="/client/login" className="btn btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '0.84rem' }}>Client Login</Link>
          )}
        </div>
      </nav>

      {/* Flash Alert Messages */}
      {flash && (
        <div 
          className={`flash ${flash.type}`}
          style={{
            position: 'fixed',
            top: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            width: '90%',
            zIndex: 1000,
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
            background: flash.type === 'success' ? '#DCFCE7' : '#FEE2E2',
            color: flash.type === 'success' ? '#15803D' : '#B91C1C',
            border: flash.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FECACA'
          }}
        >
          <span>{flash.msg}</span>
          <button 
            onClick={() => setFlash(null)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              font: 'inherit', 
              fontSize: '1.1rem',
              lineHeight: 1,
              cursor: 'pointer', 
              color: 'inherit',
              opacity: 0.75,
              padding: '0.2rem'
            }}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-tag-wrapper">
              <span className="hero-tag-badge">📍 BASED IN GOWLIDODDI, HYDERABAD</span>
            </div>
            <h1 className="hero-title">
              Websites that bring <br />
              <span className="highlight">
                <span 
                  id="typeWord" 
                  style={{ opacity: typeOpacity, transform: typeTransform, display: 'inline-block', transition: 'opacity 0.15s ease-out, transform 0.15s ease-out' }}
                >
                  {typeWords[typeIdx]}
                </span>
              </span> customers.
            </h1>
            <p className="hero-subtitle">Helping Hyderabad businesses get more customers with modern websites, WhatsApp bookings, and Google Search visibility.</p>

            {/* Feature list */}
            <div className="hero-features-grid">
              <div className="hero-feature-item">
                <div className="hero-feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div className="hero-feature-text">
                  <strong>Trusted by Local Businesses</strong>
                  <span className="feature-subtext">⭐⭐⭐⭐⭐ 5.0 (18+ reviews)</span>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="hero-feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="hero-feature-text">
                  <strong>Serving across Hyderabad</strong>
                  <span className="feature-subtext">Gachibowli • Kondapur • Kokapet • Financial District • Manikonda</span>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="hero-feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="hero-feature-text">
                  <strong>Fast Delivery</strong>
                  <span className="feature-subtext">2-Day First Demo</span>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="hero-feature-icon-wrapper">
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div className="hero-feature-text">
                  <strong>WhatsApp Integrated</strong>
                  <span className="feature-subtext">Direct bookings & enquiries</span>
                </div>
              </div>
            </div>

            {/* Hero Buttons */}
            <div className="hero-btn-group">
              <a 
                href="#contact" 
                className="btn btn-primary"
                onMouseMove={(e) => handleMagneticMouseMove(e, e.currentTarget)}
                onMouseLeave={(e) => handleMagneticMouseLeave(e.currentTarget)}
              >
                Get My Free Demo →
              </a>
              <a 
                href="#work" 
                className="btn btn-outline"
                onMouseMove={(e) => handleMagneticMouseMove(e, e.currentTarget)}
                onMouseLeave={(e) => handleMagneticMouseLeave(e.currentTarget)}
              >
                See My Work
              </a>
            </div>
          </div>

          {/* Hero Right (Mockups) */}
          <div className="hero-right">
            <div className="hero-mockup-wrapper">
              <img src="/images/hero-mockup.png" alt="Dev.hyd Mockups" className="hero-mockup-image" />
            </div>
          </div>
        </div>

        {/* Hero Bottom Bar */}
        <div className="hero-bottom-bar">
          <div className="worked-with-marquee-row">
            <span className="worked-with-title">Worked With</span>
            <button type="button" className="marquee-arrow marquee-arrow-left" onClick={() => handleMarqueeScroll('left')}>‹</button>
            <div className="marquee-track" ref={marqueeTrackRef}>
              <div className="marquee-inner">
                <div className="worked-logo-item"><span className="worked-icon">✂️</span> Salon</div>
                <div className="worked-logo-item"><span className="worked-icon">☕</span> Cafe</div>
                <div className="worked-logo-item"><span className="worked-icon">🩺</span> Clinic</div>
                <div className="worked-logo-item"><span className="worked-icon">🛍️</span> Boutique</div>
                <div className="worked-logo-item"><span className="worked-icon">🎓</span> Academy</div>
                <div className="worked-logo-item"><span className="worked-icon">💪</span> Gym</div>
                <div className="worked-logo-item"><span className="worked-icon">🍴</span> Restaurant</div>
                {/* Duplicate 1 */}
                <div className="worked-logo-item"><span className="worked-icon">✂️</span> Salon</div>
                <div className="worked-logo-item"><span className="worked-icon">☕</span> Cafe</div>
                <div className="worked-logo-item"><span className="worked-icon">🩺</span> Clinic</div>
                <div className="worked-logo-item"><span className="worked-icon">🛍️</span> Boutique</div>
                <div className="worked-logo-item"><span className="worked-icon">🎓</span> Academy</div>
                <div className="worked-logo-item"><span className="worked-icon">💪</span> Gym</div>
                <div className="worked-logo-item"><span className="worked-icon">🍴</span> Restaurant</div>
                {/* Duplicate 2 */}
                <div className="worked-logo-item"><span className="worked-icon">✂️</span> Salon</div>
                <div className="worked-logo-item"><span className="worked-icon">☕</span> Cafe</div>
                <div className="worked-logo-item"><span className="worked-icon">🩺</span> Clinic</div>
                <div className="worked-logo-item"><span className="worked-icon">🛍️</span> Boutique</div>
                <div className="worked-logo-item"><span className="worked-icon">🎓</span> Academy</div>
                <div className="worked-logo-item"><span className="worked-icon">💪</span> Gym</div>
                <div className="worked-logo-item"><span className="worked-icon">🍴</span> Restaurant</div>
              </div>
            </div>
            <button type="button" className="marquee-arrow marquee-arrow-right" onClick={() => handleMarqueeScroll('right')}>›</button>
          </div>
          <div className="bottom-bar-divider"></div>
          
          <div className="hero-stats-container" ref={statsContainerRef}>
            {stats.map((stat, i) => (
              <div className="hero-stat-box" key={i}>
                <span className="hero-stat-number">
                  {stat.current.toLocaleString('en-IN')}{stat.suffix}
                </span>
                <span className="hero-stat-desc">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-left" data-reveal>
            <span className="section-tag-small">ABOUT ME</span>
            <h2 className="about-title">Hi, I'm Rithvik.</h2>
            <p className="about-desc">I help local businesses in Hyderabad build fast, modern websites that attract more customers and grow their brand online.</p>
            <ul className="about-checklist" ref={checklistRef}>
              <li><span className="checkmark">✓</span> 2+ Years in Web Development</li>
              <li><span className="checkmark">✓</span> 100% Client Satisfaction</li>
              <li><span className="checkmark">✓</span> Clean Design & Fast Websites</li>
              <li><span className="checkmark">✓</span> Affordable & Transparent Pricing</li>
            </ul>
            <a 
              href="#contact" 
              className="btn btn-primary"
              onMouseMove={(e) => handleMagneticMouseMove(e, e.currentTarget)}
              onMouseLeave={(e) => handleMagneticMouseLeave(e.currentTarget)}
            >
              Let's Work Together →
            </a>
          </div>
          <div className="about-right" data-reveal>
            <div className="about-image-wrapper" ref={imageWrapperRef}>
              <img src="/images/rithvik.png" alt="Rithvik" className="about-image" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROCESS SECTION */}
      <section id="process" className="process-section">
        <span className="section-tag-small" data-reveal>MY PROCESS</span>
        <h2 className="process-title" data-reveal>Simple process. Great results.</h2>

        <div className="process-flow">
          {/* Step 1 */}
          <div className="process-step" data-reveal>
            <div className="process-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="process-number">01</div>
            <h3 className="process-step-title">Consultation</h3>
            <p className="process-step-desc">We discuss your business needs and goals.</p>
          </div>

          <div className="process-line" data-reveal></div>

          {/* Step 2 */}
          <div className="process-step" data-reveal>
            <div className="process-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8Z" />
              </svg>
            </div>
            <div className="process-number">02</div>
            <h3 className="process-step-title">Design</h3>
            <p className="process-step-desc">I create a modern design that represents your brand.</p>
          </div>

          <div className="process-line" data-reveal></div>

          {/* Step 3 */}
          <div className="process-step" data-reveal>
            <div className="process-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="process-number">03</div>
            <h3 className="process-step-title">Development</h3>
            <p className="process-step-desc">I build a fast, responsive website.</p>
          </div>

          <div className="process-line" data-reveal></div>

          {/* Step 4 */}
          <div className="process-step" data-reveal>
            <div className="process-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <div className="process-number">04</div>
            <h3 className="process-step-title">Launch</h3>
            <p className="process-step-desc">Your website goes live and is ready to grow.</p>
          </div>

          <div className="process-line" data-reveal></div>

          {/* Step 5 */}
          <div className="process-step" data-reveal>
            <div className="process-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                <line x1="19.07" y1="4.93" x2="14.83" y2="9.17" />
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                <line x1="9.17" y1="14.83" x2="4.93" y2="19.07" />
              </svg>
            </div>
            <div className="process-number">05</div>
            <h3 className="process-step-title">Support</h3>
            <p className="process-step-desc">I provide support and help you succeed.</p>
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section id="services" className="services-section">
        <span className="section-tag-small" data-reveal>WHAT I DO</span>
        <h2 className="services-title" data-reveal>Everything your business needs online.</h2>

        <div className="services-grid-new">
          {services.map((service, index) => (
            <div 
              key={service._id}
              className="service-card-new tilt-card" 
              data-reveal
              onMouseMove={(e) => {
                handleTiltMouseMove(e, e.currentTarget)
                handleServiceMouseMove(e, e.currentTarget)
              }}
              onMouseLeave={(e) => handleTiltMouseLeave(e.currentTarget)}
            >
              <div className="tilt-glare"></div>
              <div className={`service-icon-box service-icon-${service.icon || 'blue'}`}>
                {renderServiceIcon(service.icon)}
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.description}</p>
              <div className="service-card-price">{service.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PORTFOLIO SECTION */}
      <PortfolioSection items={galleryItems} />

      {/* 6. TESTIMONIALS SECTION */}
      <TestimonialsSection reviews={testimonials} />

      {/* 7. PROJECT COST CALCULATOR & PRICING */}
      <CostCalculator />

      {/* 8. SERVICES COMPARISON MATRIX */}
      <ServicesMatrix />

      {/* 8. FAQ SECTION */}
      <section 
        id="faq" 
        className="faq-section" 
        ref={faqSectionRef}
        onMouseMove={handleFaqMouseMove}
      >
        <span className="section-tag-small" data-reveal>FAQ</span>
        <h2 className="faq-title" data-reveal>Frequently asked questions.</h2>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div data-reveal key={faq._id}>
              <div className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span className="faq-num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="faq-question-text">{faq.question}</span>
                  <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. BLOG SECTION (DYNAMIC LATEST POSTS) */}
      {posts.length > 0 && (
        <section id="latest-blog" className="blog-section-home">
          <span className="section-tag-small" data-reveal>LATEST INSIGHTS</span>
          <h2 className="blog-section-title" data-reveal>Read my blog.</h2>

          <div className="blog-grid-home">
            {posts.map(post => {
              const readTime = Math.max(1, Math.ceil((post.content?.split(' ').length || 200) / 200))
              const dateObj = post.created_at ? new Date(post.created_at) : null
              const dateLabel = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null
              return (
                <article key={post.id || post._id} className="blog-card-home">
                  {post.cover ? (
                    <div className="blog-card-image-wrap">
                      <img src={post.cover} alt={post.title} className="blog-card-img" />
                    </div>
                  ) : (
                    <div className="blog-card-image-placeholder">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><polyline points="17 2 17 8 23 8"/></svg>
                    </div>
                  )}
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      {dateLabel && <span className="blog-card-date">{dateLabel}</span>}
                      <span className="blog-card-read-time">{readTime} min read</span>
                    </div>
                    <h3 className="blog-card-title">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                    <Link to={`/blog/${post.slug}`} className="blog-card-cta">Read Post →</Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* 10. CONTACT SECTION */}
      <section id="contact" className="contact-section-new" ref={contactSecRef}>
        <div className="contact-container">
          <div className="contact-left" data-reveal>
            <span className="section-tag-small">GET IN TOUCH</span>
            <h2 className="contact-title">Let's discuss your project.</h2>
            <p className="contact-desc">Ready to get more customers online? Contact me for a 100% free concept demo. I'll show you how your business can look online before you pay anything.</p>

            <div className="contact-info-list">
              {/* WhatsApp Card */}
              <a href={settings.socialLinks?.whatsapp || "https://wa.me/917780252258"} target="_blank" rel="noreferrer" className="contact-info-card">
                <div className="contact-card-icon whatsapp">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.282 3.51 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.743 1.451 5.48.002 9.932-4.447 9.935-9.93.001-2.657-1.032-5.155-2.909-7.033A9.855 9.855 0 0 0 12.008 1.14c-5.485 0-9.937 4.453-9.94 9.937-.001 1.637.473 3.23 1.373 4.606l-.999 3.65 3.748-.98c1.393.76 2.871 1.161 4.457 1.161zm11.067-7.461c-.302-.15-1.785-.882-2.062-.982-.278-.1-.48-.15-.68.15-.2.3-.775.982-.95 1.182-.175.2-.35.225-.65.075-.3-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.785-1.675-2.085-.175-.3-.018-.462.132-.61l.394-.46c.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.68-1.638-.93-2.244-.244-.587-.492-.51-.68-.52h-.58c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.112 4.521.714.308 1.272.493 1.706.632.716.228 1.368.196 1.883.119.574-.085 1.785-.73 2.037-1.435.252-.705.252-1.31.176-1.435-.076-.125-.277-.2-.58-.35z" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <strong>Message on WhatsApp</strong>
                  <span>+91 77802 52258 (Direct chat)</span>
                </div>
              </a>

              {/* Email Card */}
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=dev.hyd.official@gmail.com&su=Website%20Enquiry%20from%20Portfolio&body=Hi%20Rithvik%2C%20I%20would%20like%20to%20discuss%20a%20website%20project." 
                target="_blank"
                rel="noreferrer"
                onClick={handleComposeEmail}
                className="contact-info-card"
              >
                <div className="contact-card-icon email">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <strong>Email Enquiry</strong>
                  <span>dev.hyd.official@gmail.com</span>
                </div>
              </a>

              {/* Instagram Card */}
              <a href={settings.socialLinks?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" className="contact-info-card">
                <div className="contact-card-icon instagram">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div className="contact-card-content">
                  <strong>Instagram DM</strong>
                  <span>@dev.hyd (Portfolio & updates)</span>
                </div>
              </a>
            </div>
          </div>

          <div className="contact-right" data-reveal>
            <div className="contact-form-card">
              <div className="contact-form-header">
                <span className="contact-form-badge">💬 Fast Response</span>
                <h3 className="contact-form-title">Send us a message</h3>
                <p className="contact-form-subtitle">Have a project in mind? We'd love to help your business grow online!</p>
              </div>

              <form onSubmit={handleContactSubmit} noValidate>
                <div className="form-field-group">
                  <div className="form-field">
                    <label htmlFor="c_name">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Your Name *
                    </label>
                    <input 
                      type="text" 
                      id="c_name" 
                      placeholder="e.g. Karthik Reddy" 
                      value={name} 
                      onChange={(e) => {
                        setName(e.target.value)
                        if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }))
                      }} 
                      className={formErrors.name ? 'input-error' : ''}
                    />
                    {formErrors.name && (
                      <span className="field-error-hint">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {formErrors.name}
                      </span>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="c_biz">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3h6v4H9z"/></svg>
                      Business Name <span className="lbl-tag">Optional</span>
                    </label>
                    <input 
                      type="text" 
                      id="c_biz" 
                      placeholder="e.g. Modern Bistro Gowlidoddi" 
                      value={business} 
                      onChange={(e) => setBusiness(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <div className="form-field">
                    <label htmlFor="c_phone">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Phone / WhatsApp *
                    </label>
                    <input 
                      type="tel" 
                      id="c_phone" 
                      placeholder="e.g. 98765 43210" 
                      value={phone} 
                      onChange={(e) => {
                        setPhone(e.target.value)
                        if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: null }))
                      }} 
                      className={formErrors.phone ? 'input-error' : ''}
                    />
                    {formErrors.phone && (
                      <span className="field-error-hint">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="c_email">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      id="c_email" 
                      placeholder="e.g. karthik@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="c_service">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Service Needed *
                  </label>
                  <div className="select-wrapper">
                    <select 
                      id="c_service" 
                      value={service} 
                      onChange={(e) => {
                        setService(e.target.value)
                        if (formErrors.service) setFormErrors(prev => ({ ...prev, service: null }))
                      }} 
                      className={formErrors.service ? 'input-error' : ''}
                    >
                      <option value="">Select a service...</option>
                      {services.map(s => (
                        <option value={`${s.title} (${s.price})`} key={s._id}>
                          {s.title} ({s.price})
                        </option>
                      ))}
                      <option value="Custom Website Quote">Custom Website Quote</option>
                    </select>
                  </div>
                  {formErrors.service && (
                    <span className="field-error-hint">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {formErrors.service}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Approximate Budget
                  </label>
                  <div className="form-radio-grid">
                    {[
                      { val: 'Under ₹5,000', icon: '🌱' },
                      { val: '₹5,000 – ₹10,000', icon: '🚀' },
                      { val: '₹10,000 – ₹20,000', icon: '⭐' },
                      { val: '₹20,000+', icon: '👑' }
                    ].map(b => (
                      <label className={`form-radio-card ${budget === b.val ? 'active' : ''}`} key={b.val}>
                        <input 
                          type="radio" 
                          name="budget" 
                          value={b.val} 
                          checked={budget === b.val}
                          onChange={(e) => setBudget(e.target.value)}
                        />
                        <div className="radio-left">
                          <span className="radio-icon">{b.icon}</span>
                          <span className="radio-text">{b.val}</span>
                        </div>
                        <span className="radio-checkmark">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="c_msg">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Tell me about your business
                  </label>
                  <textarea 
                    id="c_msg" 
                    rows="3" 
                    placeholder="e.g. We are a salon in Kokapet. We want a 5-page site with services list and WhatsApp booking."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="dual-submit-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button 
                    type="button" 
                    className="submit-btn-friendly" 
                    onClick={handleSendWhatsApp}
                    style={{ background: '#25D366', color: '#ffffff', borderColor: '#25D366' }}
                  >
                    <span>💬 Send WhatsApp</span>
                  </button>

                  <button 
                    type="button" 
                    className="submit-btn-friendly" 
                    onClick={handleComposeEmail}
                    style={{ background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}
                  >
                    <span>✉️ Compose Email</span>
                  </button>
                </div>

                <button type="submit" className="submit-btn-friendly" disabled={submitting} style={{ marginTop: '0.75rem' }}>
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Website Enquiry</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </>
                  )}
                </button>

                <div className="form-trust-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>100% Free Consultation • No Spam • We reply within 2 hours</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-container">
          <div className="footer-left">
            <Link to="/" className="logo">{settings.siteName ? settings.siteName.replace(/(\.hyd)+$/i, '') : 'dev'}<span>.</span>hyd</Link>
            <p className="footer-tagline">Web development and digital presence for local businesses in Hyderabad.</p>
            <div className="footer-socials">
              {settings.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {settings.socialLinks?.whatsapp && (
                <a href={settings.socialLinks.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.282 3.51 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.743 1.451 5.48.002 9.932-4.447 9.935-9.93.001-2.657-1.032-5.155-2.909-7.033A9.855 9.855 0 0 0 12.008 1.14c-5.485 0-9.937 4.453-9.94 9.937-.001 1.637.473 3.23 1.373 4.606l-.999 3.65 3.748-.98c1.393.76 2.871 1.161 4.457 1.161zm11.067-7.461c-.302-.15-1.785-.882-2.062-.982-.278-.1-.48-.15-.68.15-.2.3-.775.982-.95 1.182-.175.2-.35.225-.65.075-.3-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.785-1.675-2.085-.175-.3-.018-.462.132-.61l.394-.46c.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.68-1.638-.93-2.244-.244-.587-.492-.51-.68-.52h-.58c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.112 4.521.714.308 1.272.493 1.706.632.716.228 1.368.196 1.883.119.574-.085 1.785-.73 2.037-1.435.252-.705.252-1.31.176-1.435-.076-.125-.277-.2-.58-.35z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <Link to="/legal/privacy">Privacy Policy</Link>
              <Link to="/legal/terms">Terms of Service</Link>
              <Link to="/legal/refund">Refund Policy</Link>
              <Link to="/client/login">Client Portal</Link>
              <Link to="/admin/login" style={{ opacity: 0.5, fontSize: '0.78rem' }}>Admin Access</Link>
            </div>
            <p className="footer-copy">© 2026 {settings.siteName || 'dev.hyd'}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Quick Lead Button & Modal */}
      <QuickLeadWidget />
    </>
  )
}

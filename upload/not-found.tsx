'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Ticket,
  Home,
  Search,
  HelpCircle,
  ShoppingBag,
  Tag,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Bus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/* ─── Ticket SVG Illustration ─── */
function LostTicketIllustration() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto">
      {/* Ticket shape with dashed line */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full h-full"
      >
        {/* Main ticket body */}
        <motion.div
          animate={{
            boxShadow: [
              '0 8px 32px rgba(22, 163, 74, 0.15)',
              '0 16px 48px rgba(22, 163, 74, 0.25)',
              '0 8px 32px rgba(22, 163, 74, 0.15)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-50 to-teal-50 dark:from-primary/15 dark:via-emerald-950/30 dark:to-teal-950/20 border-2 border-dashed border-primary/30 backdrop-blur-sm"
        >
          {/* Ticket top section */}
          <div className="p-5 sm:p-6 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Bus className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">ETR Express</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground/70">Dhaka</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground/70">???</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Lost in transit...</span>
              </div>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="relative mx-5">
            <div className="border-t border-dashed border-primary/20" />
            <div className="absolute -left-7 -top-1.5 w-3 h-3 rounded-full bg-background" />
            <div className="absolute -right-7 -top-1.5 w-3 h-3 rounded-full bg-background" />
          </div>

          {/* Ticket bottom section */}
          <div className="p-5 sm:p-6 pt-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Seat</p>
              <p className="text-lg font-bold text-foreground/50">?</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs font-bold text-orange-500"
              >
                NOT FOUND
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Floating question marks */}
        <motion.div
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary"
        >
          ?
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-500"
        >
          ?
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
          className="absolute top-1/4 -left-6 w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-bold text-orange-400"
        >
          !
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─── Popular Link Card ─── */
function PopularLink({ href, icon: Icon, label, description, color }: {
  href: string
  icon: React.ElementType
  label: string
  description: string
  color: string
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1 ml-auto" />
      </motion.div>
    </Link>
  )
}

/* ─── Container Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function NotFound() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/find-tickets?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-8">
      {/* ── Decorative Background Elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-[60px]" />

        {/* Dotted pattern */}
        <div
          className="absolute inset-0 hero-pattern opacity-40"
        />

        {/* Floating small elements */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.3 }}
          className="absolute top-[12%] left-[10%] w-4 h-4 rounded-md bg-primary/10 rotate-12"
        />
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.8 }}
          className="absolute top-[20%] right-[15%] w-3 h-3 rounded-full bg-emerald-400/15"
        />
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1.2 }}
          className="absolute bottom-[25%] left-[20%] w-5 h-5 rounded-md bg-accent/10 -rotate-12"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-[15%] right-[10%] w-3 h-3 rounded-full bg-primary/15"
        />
      </div>

      {/* ── Main Content ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Lost Ticket Illustration */}
        <motion.div variants={itemVariants} className="mb-6">
          <LostTicketIllustration />
        </motion.div>

        {/* Large 404 Number */}
        <motion.h1
          variants={itemVariants}
          className="text-8xl sm:text-9xl font-extrabold text-gradient text-center mb-3 leading-none"
        >
          404
        </motion.h1>

        {/* Page Not Found */}
        <motion.div variants={itemVariants} className="text-center mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Looks like this ticket got lost in transit!
          </p>
        </motion.div>

        {/* Fun decorative badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/30">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              The page you&apos;re looking for doesn&apos;t exist
            </span>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for tickets, routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-4 rounded-xl bg-card border-border focus:border-primary/50"
            />
          </form>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link href="/" className="flex-1">
            <Button className="w-full h-11 rounded-xl btn-primary gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/find-tickets" className="flex-1">
            <Button variant="outline" className="w-full h-11 rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary hover:text-white">
              <Search className="w-4 h-4" />
              Find Tickets
            </Button>
          </Link>
        </motion.div>

        {/* Popular Links Section */}
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3">
            Popular Destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <PopularLink
              href="/find-tickets"
              icon={Search}
              label="Find Tickets"
              description="Browse available tickets"
              color="bg-gradient-to-br from-primary to-emerald-500"
            />
            <PopularLink
              href="/sell-tickets"
              icon={Tag}
              label="Sell Tickets"
              description="List your unused tickets"
              color="bg-gradient-to-br from-secondary to-orange-400"
            />
            <PopularLink
              href="/help"
              icon={HelpCircle}
              label="Help Center"
              description="Get answers & support"
              color="bg-gradient-to-br from-violet-500 to-purple-500"
            />
            <PopularLink
              href="/faqs"
              icon={ShoppingBag}
              label="FAQs"
              description="Common questions"
              color="bg-gradient-to-br from-sky-500 to-blue-500"
            />
          </div>
        </motion.div>

        {/* Bottom Branding */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            EidTicketResell &middot; Buy & Sell Unused Eid Travel Tickets
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

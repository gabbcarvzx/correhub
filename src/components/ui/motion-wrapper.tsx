"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"
import { forwardRef, type ElementRef } from "react"

const ease = [0.4, 0, 0.2, 1] as const

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
}

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
}

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
}

interface MotionDivProps extends HTMLMotionProps<"div"> {
  as?: "div"
}

const MotionDiv = forwardRef<ElementRef<"div">, MotionDivProps>(
  ({ initial = "hidden", animate = "visible", variants = fadeInUp, ...props }, ref) => (
    <motion.div ref={ref} initial={initial} animate={animate} variants={variants} {...props} />
  ),
)
MotionDiv.displayName = "MotionDiv"

interface MotionSectionProps extends HTMLMotionProps<"section"> {
  as?: "section"
}

const MotionSection = forwardRef<ElementRef<"section">, MotionSectionProps>(
  ({ initial = "hidden", animate = "visible", variants = fadeInUp, ...props }, ref) => (
    <motion.section ref={ref} initial={initial} animate={animate} variants={variants} {...props} />
  ),
)
MotionSection.displayName = "MotionSection"

export {
  MotionDiv,
  MotionSection,
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  staggerItem,
  slideInLeft,
  slideInRight,
}

import { cn } from '@/utils/cn'

interface BrandMarkProps {
  className?: string
}

/** IceGod 品牌标：六棱冰晶。颜色跟随 currentColor */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('w-5 h-5', className)}>
      <path d="M16 3.5 26.8 9.75v12.5L16 28.5 5.2 22.25V9.75L16 3.5Z" fill="currentColor" opacity="0.18" />
      <path d="M16 3.5 26.8 9.75v12.5L16 28.5 5.2 22.25V9.75L16 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 9v14M10 12.5l12 7M22 12.5l-12 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const logoSizes = {
  sm: 'w-8 h-8 rounded-lg [&>svg]:w-[18px] [&>svg]:h-[18px]',
  md: 'w-10 h-10 rounded-xl [&>svg]:w-[22px] [&>svg]:h-[22px]',
  lg: 'w-14 h-14 rounded-2xl [&>svg]:w-8 [&>svg]:h-8',
}

/** 带底色的品牌标，用于侧栏、登录页和关于页 */
export function BrandLogo({ size = 'sm', className }: BrandLogoProps) {
  return (
    <span className={cn('brand-logo inline-flex flex-shrink-0 items-center justify-center', logoSizes[size], className)}>
      <BrandMark />
    </span>
  )
}
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/** Milky frosted surface. The only container style used over the mall. */
export function GlassPanel({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('glass rounded-[22px]', className)} {...p} />
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet'
  size?: 'md' | 'lg'
  icon?: LucideIcon
  trailingIcon?: LucideIcon
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, trailingIcon: Trail, className, children, ...p },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100',
        size === 'lg' ? 'h-14 px-6 text-[16px]' : 'h-11 px-5 text-[14px]',
        variant === 'primary' && 'bg-ink text-white shadow-[0_10px_24px_-12px_rgb(38_38_38/0.6)] hover:bg-[#333]',
        variant === 'secondary' && 'glass text-ink',
        variant === 'quiet' && 'bg-cream text-ink hover:bg-soft',
        className,
      )}
      {...p}
    >
      {Icon && <Icon size={size === 'lg' ? 20 : 18} strokeWidth={1.8} />}
      {children}
      {Trail && <Trail size={size === 'lg' ? 20 : 18} strokeWidth={1.8} />}
    </button>
  )
})

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; badge?: ReactNode; tone?: 'glass' | 'plain' }
export function IconButton({ icon: Icon, label, badge, tone = 'glass', className, ...p }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cx(
        'relative grid h-11 w-11 place-items-center rounded-full text-ink transition-transform active:scale-95',
        tone === 'glass' ? 'glass' : 'bg-cream',
        className,
      )}
      {...p}
    >
      <Icon size={19} strokeWidth={1.8} />
      {badge != null && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-purple px-1 text-[10px] font-semibold text-white tnum">
          {badge}
        </span>
      )}
    </button>
  )
}

export function Badge({ tone = 'neutral', className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'success' | 'promo' | 'purple' }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-micro font-semibold whitespace-nowrap',
        tone === 'neutral' && 'bg-soft text-ink-2',
        tone === 'success' && 'bg-[#E4EEE5] text-success',
        tone === 'promo' && 'bg-[#FBEBDC] text-[#8F531B]',
        tone === 'purple' && 'bg-purple-soft text-purple-ink',
        className,
      )}
      {...p}
    />
  )
}

/** Small brand mark: a rounded square in the brand colour with its initial. Text only, no logos. */
export function BrandMark({ name, bg, fg, size = 36 }: { name: string; bg: string; fg: string; size?: number }) {
  const light = bg.toLowerCase() === '#ffffff'
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[11px] font-semibold"
      style={{ width: size, height: size, background: light ? '#F6F3ED' : bg, color: fg, fontSize: size * 0.42, boxShadow: light ? 'inset 0 0 0 1px rgb(38 38 38 / 0.08)' : undefined }}
      aria-hidden
    >
      {name.replace(/^Tata\s+/, '')[0]}
    </span>
  )
}

export { cx }

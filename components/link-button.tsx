import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'

type ButtonProps = ComponentProps<typeof Button>

/**
 * Button that navigates via Next.js Link.
 * Base UI requires nativeButton={false} when render is a non-<button> element.
 */
export function LinkButton({
  href,
  children,
  ...props
}: { href: string } & Omit<ButtonProps, 'render'>) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props}>
      {children}
    </Button>
  )
}

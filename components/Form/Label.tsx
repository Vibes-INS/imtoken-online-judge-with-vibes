import { PropsWithChildren } from 'react'

export const Label: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <label htmlFor="nonce-input" className="w-[70px] block mb-2">
      {children}:
    </label>
  )
}

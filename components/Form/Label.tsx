import { PropsWithChildren } from 'react'

export interface LabelProps extends PropsWithChildren {
  isRequired?: boolean
}

export const Label: React.FC<LabelProps> = ({ isRequired, children }) => {
  return (
    <label htmlFor="nonce-input" className="w-[70px] block mb-2">
      {isRequired ? <span className="text-red-400">*</span> : null}
      {children}:
    </label>
  )
}

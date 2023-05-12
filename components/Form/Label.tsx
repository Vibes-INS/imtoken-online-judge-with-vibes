import { PropsWithChildren } from 'react'

export interface LabelProps extends PropsWithChildren {
  isRequired?: boolean
  htmlFor: string
}

export const Label: React.FC<LabelProps> = ({
  isRequired,
  htmlFor,
  children,
}) => {
  return (
    <label htmlFor={htmlFor} className="w-full block mb-2">
      {isRequired ? <span className="text-red-400">*</span> : null}
      {children}:
    </label>
  )
}

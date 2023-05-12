import { PropsWithChildren } from 'react'

export const FormErrorMessage: React.FC<PropsWithChildren> = ({ children }) => {
  return <p className="text-sm text-red-700">{children}</p>
}

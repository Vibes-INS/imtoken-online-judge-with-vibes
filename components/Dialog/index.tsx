import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'

const DialogContext = createContext({
  isOpen: false,
  onClose: () => {},
})

export interface DialogProps extends PropsWithChildren {
  isOpen: boolean
  onClose: () => void
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [isOpenWithAnimation, setIsOpenWithAnimation] = useState(isOpen)
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false)
  useEffect(() => {
    if (!isOpen) {
      setIsPlayingAnimation(true)
      const timeout = setTimeout(() => {
        setIsPlayingAnimation(false)
        setIsOpenWithAnimation(isOpen)
      }, 300)
      return () => window.clearTimeout(timeout)
    } else {
      setIsOpenWithAnimation(isOpen)
    }
  }, [isOpen])
  const hideAnimationClassName = isPlayingAnimation ? 'animate-hide-dialog' : ''

  return (
    <DialogContext.Provider value={{ isOpen: isOpenWithAnimation, onClose }}>
      {isOpenWithAnimation ? (
        <div
          className={`fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center z-50 ${
            !isOpen ? hideAnimationClassName : 'animate-show-dialog'
          }`}
        >
          {children}
        </div>
      ) : null}
    </DialogContext.Provider>
  )
}

export const DialogOverlay: React.FC = () => {
  const { onClose } = useContext(DialogContext)
  return (
    <div
      className="absolute top-0 left-0 w-full h-full bg-black opacity-20"
      onClick={onClose}
    />
  )
}

export const DialogCloseButton: React.FC = () => {
  const { onClose } = useContext(DialogContext)
  return (
    <button onClick={onClose} className="absolute top-4 right-4">
      Close
    </button>
  )
}

export const DialogContent: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="bg-white w-[95%] max-w-[400px] min-h-[200px] relative z-10 rounded-xl shadow-xl">
      {children}
    </div>
  )
}

export const DialogHeader: React.FC<PropsWithChildren> = ({ children }) => {
  return <h3 className="font-medium text-lg mb-2 text-center">{children}</h3>
}

export const DialogDescription: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <p className="text-center mb-auto">{children}</p>
}

export interface DialogStatusIconProps {
  status: 'success' | 'error'
}

export const DialogStatusIcon: React.FC<DialogStatusIconProps> = ({
  status,
}) => {
  return (
    <div className="w-[50px] h-[50px] rounded-full leading-[50px] text-white m-auto text-3xl">
      {
        {
          success: '✅',
          error: '❌',
        }[status]
      }
    </div>
  )
}

'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { goerli, useAccount, useNetwork } from 'wagmi'
import { useProvider } from '@/hooks/useProvider'
import { GOERLI_FAUCET_URL } from '@/constants'
import { useIsClient } from '@/hooks/useIsClient'
import { Label } from '@/components/Form/Label'
import { ethers } from 'ethers'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogStatusIcon,
} from '@/components/Dialog'

export const Home = () => {
  const [address, setAddress] = useState('')
  const [nonce, setNonce] = useState('')
  const [amount, setAmount] = useState('')
  const [isShowMoreOptions, setIsShowMoreOptions] = useState(false)

  const account = useAccount()
  const provider = useProvider()
  const network = useNetwork()
  const isClient = useIsClient()
  const signer = useMemo(() => provider?.getSigner(), [provider])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [dialogInfo, setDialogInfo] = useState<{
    title: ReactNode
    description: ReactNode
    status: 'success' | 'error'
  } | null>()

  useEffect(() => {
    if (account.address && provider) {
      provider
        .getTransactionCount(account.address)
        .then((r) => setNonce(`${r}`))
    }
  }, [account.address, provider])

  const onSubmit = useCallback(
    async (
      n: string,
      to: string,
      options?: {
        amount?: string
      }
    ) => {
      if (!signer || !provider) return
      if (!n) return
      if (!to) return
      try {
        setIsSubmitting(true)
        const value = options?.amount
          ? ethers.utils.parseEther(options.amount)
          : undefined
        const gasLimit = await provider.estimateGas({
          from: signer.getAddress(),
          to,
          nonce: n,
          value,
        })
        const tx = await signer.sendTransaction({
          to,
          nonce: n,
          value,
          gasLimit,
        })
        const receipt = await tx.wait()
        setIsOpen(true)
        setDialogInfo({
          status: 'success',
          title: 'Successfully sent transaction',
          description: (
            <>
              Click to view explorer{' '}
              <a
                className="underline text-blue-600"
                href={`${network.chain?.blockExplorers?.default.url}/tx/${receipt.transactionHash}`}
                target="_blank"
              >
                details
              </a>
            </>
          ),
        })
        console.log(receipt)
      } catch (error: any) {
        setIsOpen(true)
        setDialogInfo({
          status: 'error',
          title: 'Error',
          description: error.message,
        })
        console.error(error)
      }
      setIsSubmitting(false)
    },
    [network.chain?.blockExplorers?.default.url, provider, signer]
  )

  return (
    <div className="w-full h-screen flex flex-col">
      <nav className="flex px-8 py-3 shadow-md bg-white justify-between items-center sm:flex-row flex-col gap-2 sm:gap-0">
        <h3 className="text-lg font-bold">imToken Online Judge</h3>
        <ConnectButton />
      </nav>
      <main className="flex items-center sm:pt-20 pt-10 flex-col w-full flex-1">
        <div className="flex flex-col gap-4 w-full max-w-[375px] px-4">
          {isClient && network.chain?.id === goerli.id ? (
            <div>
              <a
                className="underline text-blue-600"
                href={GOERLI_FAUCET_URL}
                target="_blank"
              >
                Goerli Faucet
              </a>
            </div>
          ) : null}

          <div>
            <Label isRequired>Address</Label>
            <textarea
              id="address-input"
              className="border rounded py-2 px-4 w-full resize-none h-[70px]"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label isRequired>Nonce</Label>
            <input
              id="nonce-input"
              type="text"
              className="border rounded py-2 px-4 w-full"
              value={nonce}
              placeholder="Nonce"
              onChange={(e) => setNonce(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsShowMoreOptions((s) => !s)}
            className="underline text-blue-600 mr-auto"
          >
            {isShowMoreOptions ? '📂' : '📁'}Options
          </button>
          {isShowMoreOptions ? (
            <div>
              <Label>Amount</Label>
              <input
                id="nonce-input"
                type="text"
                className="border rounded py-2 px-4 w-full"
                placeholder="Amount of Ether"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          ) : null}
          <div className="flex justify-end">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
              disabled={!address || !nonce || isSubmitting}
              onClick={() => onSubmit(nonce, address, { amount })}
            >
              {isSubmitting ? 'Submitting' : 'Submit'}
            </button>
          </div>
        </div>
      </main>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogOverlay />
        <DialogContent>
          <DialogCloseButton />
          {dialogInfo ? (
            <div className="py-6 px-6 text-center flex h-full flex-col">
              <DialogStatusIcon status={dialogInfo.status} />
              <DialogHeader>{dialogInfo.title}</DialogHeader>
              <DialogDescription>{dialogInfo.description}</DialogDescription>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

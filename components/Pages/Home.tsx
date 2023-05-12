'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { goerli, useAccount, useNetwork } from 'wagmi'
import { useProvider } from '@/hooks/useProvider'
import { GOERLI_FAUCET_URL } from '@/constants'
import { useIsClient } from '@/hooks/useIsClient'
import { Label, FormErrorMessage } from '@/components/Form'
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
import { isPrimitiveEthAddress, isValidNumber } from '@/libs/utils'

export const Home = () => {
  const [address, setAddress] = useState('')
  const [nonce, setNonce] = useState(0)
  const [amount, setAmount] = useState('')
  const [gasLimit, setGasLimit] = useState(21000)
  const [maxFeePerGas, setMaxFeePerGas] = useState(0)
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(0)

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
      provider.getTransactionCount(account.address).then((r) => setNonce(r))
    }
  }, [account.address, provider])

  const onSubmit = useCallback(
    async (
      n: number,
      to: string,
      options?: {
        amount?: string
        gasLimit?: number
        maxFeePerGas?: number
        maxPriorityFeePerGas?: number
      }
    ) => {
      if (!signer || !provider) return
      if (!n) return
      if (!to) return
      try {
        setIsSubmitting(true)

        const value = options?.amount
          ? ethers.utils.parseUnits(options.amount, 'ether')
          : undefined
        const transactionOptions = {
          maxFeePerGas: options?.maxFeePerGas
            ? ethers.utils.parseUnits(`${options.maxFeePerGas}`, 'gwei')
            : undefined,
          maxPriorityFeePerGas: options?.maxPriorityFeePerGas
            ? ethers.utils.parseUnits(`${options.maxPriorityFeePerGas}`, 'gwei')
            : undefined,
        }
        const gasLimit = options?.gasLimit
          ? options.gasLimit
          : await provider.estimateGas({
              from: signer.getAddress(),
              to,
              nonce: n,
              value,
              ...transactionOptions,
            })
        const tx = await signer.sendTransaction({
          to,
          nonce: n,
          value,
          gasLimit,
          ...transactionOptions,
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

  const isValidAddress = isPrimitiveEthAddress(address)
  const isValidNonce = isValidNumber(amount)

  return (
    <div className="w-full h-screen flex flex-col">
      <nav className="flex px-8 py-3 shadow-md bg-white justify-between items-center sm:flex-row flex-col gap-2 sm:gap-0">
        <h3 className="text-lg font-bold">imToken Online Judge</h3>
        <ConnectButton />
      </nav>
      <main className="flex items-center sm:pt-20 pt-10 flex-col w-full flex-1">
        <div className="flex flex-col gap-6 w-full max-w-[375px] px-4 relative">
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
            <Label htmlFor="address-input" isRequired>
              Address
            </Label>
            <textarea
              id="address-input"
              className="border rounded py-2 px-4 w-full resize-none h-[70px]"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {address !== '' && !isValidAddress ? (
              <FormErrorMessage>
                This is not the correct Ethereum address
              </FormErrorMessage>
            ) : null}
          </div>
          <div>
            <Label htmlFor="nonce-input" isRequired>
              Nonce
            </Label>
            <input
              id="nonce-input"
              type="number"
              className="border rounded py-2 px-4 w-full"
              value={nonce}
              placeholder="Nonce"
              onChange={(e) => setNonce(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="nonce-input">Amount (unit: Ether)</Label>
            <input
              id="nonce-input"
              type="text"
              className="border rounded py-2 px-4 w-full"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount !== '' && !isValidNonce ? (
              <FormErrorMessage>This is not a valid number</FormErrorMessage>
            ) : null}
          </div>
          <div>
            <Label htmlFor="max-fee-per-gas-input">GasLimit</Label>
            <input
              id="max-fee-per-gas-input"
              type="number"
              className="border rounded py-2 px-4 w-full"
              placeholder="GasLimit"
              value={gasLimit}
              onChange={(e) => setGasLimit(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="max-fee-per-gas-input">MaxFeePerGas</Label>
            <input
              id="max-fee-per-gas-input"
              type="number"
              className="border rounded py-2 px-4 w-full"
              placeholder="MaxFeePerGas"
              value={maxFeePerGas}
              onChange={(e) => setMaxFeePerGas(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="max-priority-fee-gas-input">
              MaxPriorityFeePerGas
            </Label>
            <input
              id="max-priority-fee-gas-input"
              type="number"
              className="border rounded py-2 px-4 w-full"
              placeholder="MaxPriorityFeePerGas"
              value={maxPriorityFeePerGas}
              onChange={(e) => setMaxPriorityFeePerGas(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end sticky bottom-0 bg-white pb-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
              disabled={
                !address ||
                !nonce ||
                isSubmitting ||
                !isValidAddress ||
                !isValidNonce
              }
              onClick={() =>
                onSubmit(nonce, address, {
                  amount,
                  maxFeePerGas,
                  maxPriorityFeePerGas,
                  gasLimit,
                })
              }
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

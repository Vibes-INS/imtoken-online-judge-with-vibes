'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { goerli, useAccount, useNetwork } from 'wagmi'
import { useProvider } from '@/hooks/useProvider'
import { GOERLI_FAUCET_URL } from '@/constants'
import { useIsClient } from '@/hooks/useIsClient'
import { Label } from '@/components/Form/Label'
import { ethers } from 'ethers'

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
        console.log(receipt)
      } catch (error) {
        console.error(error)
      }
    },
    [provider, signer]
  )

  return (
    <div className="w-full h-screen flex flex-col">
      <nav className="flex px-8 py-3 shadow-md bg-white">
        <ConnectButton />
      </nav>
      <main className="flex items-center pt-20 flex-col w-full flex-1">
        <div className="flex flex-col gap-4 w-[300px]">
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
            <Label>*Address</Label>
            <textarea
              id="address-input"
              className="border rounded py-2 px-4 w-full resize-none h-[70px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>*Nonce</Label>
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
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!address || !nonce}
              onClick={() => onSubmit(nonce, address, { amount })}
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

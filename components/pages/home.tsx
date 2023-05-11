'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { ethers } from 'ethers'

export const Home = () => {
  const [address, setAddress] = useState('')
  const [nonce, setNonce] = useState('')

  const account = useAccount()
  const network = useNetwork()
  const provider = useMemo(
    () =>
      window.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum as any)
        : null,
    [network.chain?.id, account.address]
  )
  const signer = useMemo(() => provider?.getSigner(), [provider])

  useEffect(() => {
    if (account.address && provider) {
      provider
        .getTransactionCount(account.address)
        .then((r) => setNonce(`${r}`))
    }
  }, [account.address, provider])

  const onSubmit = useCallback(
    async (n: string, to: string) => {
      if (!signer) return
      try {
        const tx = await signer.sendTransaction({
          to,
          nonce: n,
        })
        const receipt = await tx.wait()
        console.log(receipt)
      } catch (error) {
        console.error(error)
      }
    },
    [signer]
  )

  return (
    <div className="w-full h-screen flex flex-col">
      <nav className="flex px-8 py-3 shadow-md bg-white">
        <ConnectButton />
      </nav>
      <main className="flex items-center pt-20 flex-col w-full flex-1">
        <div className="flex flex-col gap-4 w-[300px]">
          <div>
            <label htmlFor="address-input" className="block mb-2">
              Address:
            </label>
            <textarea
              id="address-input"
              className="border rounded py-2 px-4 w-full resize-none h-[70px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="nonce-input" className="w-[70px] block mb-2">
              Nonce:
            </label>
            <input
              id="nonce-input"
              type="text"
              className="border rounded py-2 px-4 w-full"
              value={nonce}
              placeholder="Nonce"
              onChange={(e) => setNonce(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => onSubmit(nonce, address)}
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

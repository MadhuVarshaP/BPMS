"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { ShieldCheck, ArrowRight, Lock, Database, Globe } from "lucide-react";
import { Button } from "@/components/UI";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function LandingPage() {
  const { isLoading, isConnected, address } = useWallet();

  const features = [
    { icon: Lock, title: "Zero Trust", description: "Immutable patch verification via blockchain hashing." },
    { icon: Globe, title: "Decentralized", description: "Global distribution without central points of failure." },
    { icon: Database, title: "Audit Ready", description: "Clear, verifiable history of every system update." },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden selection:bg-emerald-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 pt-20 pb-24 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-emerald-600 p-4 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <ShieldCheck size={48} className="text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight"
        >
          Next-Gen <br />
          <span className="gradient-text">Patch Management</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 font-light leading-relaxed"
        >
          Enterprise-grade security meets blockchain transparency. <br className="hidden md:block" />
          Manage, verify, and deploy software patches with immutable trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && !!account && !!chain;

              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    isLoading={isLoading}
                    variant="primary"
                    size="lg"
                    className="text-lg px-12 py-8 rounded-2xl group shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    Connect Web3 Wallet
                    <ArrowRight
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                      size={20}
                    />
                  </Button>
                );
              }

              return (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="lg"
                    className="text-sm px-6 py-6 rounded-2xl border-white/10 hover:bg-white/5"
                  >
                    {chain.name}
                  </Button>
                  <Button
                    onClick={openAccountModal}
                    variant="primary"
                    size="lg"
                    className="text-sm px-6 py-6 rounded-2xl"
                  >
                    {account.displayName}
                  </Button>
                </div>
              );
            }}
          </ConnectButton.Custom>
          {/* <Button
            variant="outline"
            size="lg"
            className="text-lg px-12 py-8 rounded-2xl border-white/10 hover:bg-white/5"
          >
            View Docs
          </Button> */}
        </motion.div>

        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 pt-8 border-t border-white/5 w-full max-w-2xl"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
              Connected Wallet
            </p>
            <p className="font-mono text-sm text-emerald-500/90 break-all">{address}</p>
          </motion.div>
        )}
      </div>

      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + (idx * 0.1) }}
              className="glass-dark border border-white/5 p-8 rounded-3xl hover:border-emerald-500/30 transition-all duration-500 group"
            >
              <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 border-t border-white/5 opacity-40">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 grayscale brightness-200">
          <span className="text-xl font-bold tracking-widest uppercase">Ethereum</span>
          <span className="text-xl font-bold tracking-widest uppercase">Polygon</span>
          <span className="text-xl font-bold tracking-widest uppercase">Solana</span>
          <span className="text-xl font-bold tracking-widest uppercase">Base</span>
        </div>
      </div>
    </div>
  );
}

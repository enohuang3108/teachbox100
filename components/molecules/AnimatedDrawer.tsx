"use client";

import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";

const AnimatedDrawer = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const setting = {
    initial: {
      opacity: 0,
      x: -50,
      scaleX: 0.4,
      transformOrigin: "left",
    },
    animate: {
      opacity: 1,
      x: -320,
      scaleX: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 5,
        ease: [0.9, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      scaleX: 0.4,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="absolute top-10 right-5 z-10 flex items-end justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        className="absolute right-20"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          filter: "url(#goo)",
        }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="bg-primary text-primary-foreground absolute -z-10 mx-auto h-[300px] w-[300px] overflow-hidden overflow-y-auto rounded-3xl p-5"
              variants={setting}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center">
          <div className="bg-primary z-10 mx-auto flex h-[300px] items-center justify-between rounded-2xl p-1 px-2.5">
            <motion.button
              animate={{
                height: 50,
              }}
              className="bg-primary flex max-w-[50px] min-w-[50px] items-center justify-center rounded-lg bg-black"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <div className="h-4 w-4 rotate-45 rounded bg-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDrawer;

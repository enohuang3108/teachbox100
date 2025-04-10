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
    <div className="absolute flex items-end justify-center top-10 right-5 z-10">
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
              className="h-[300px] overflow-y-auto bg-primary text-primary-foreground absolute rounded-3xl overflow-hidden -z-10 w-[300px] p-5 mx-auto "
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
          <div className="flex items-center justify-between bg-primary rounded-2xl mx-auto z-10 h-[300px] p-1 px-2.5">
            <motion.button
              animate={{
                height: 50,
              }}
              className="bg-primary bg-black rounded-lg max-w-[50px] min-w-[50px] flex items-center justify-center"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <div className="h-4 rounded w-4 bg-white dark:bg-black rotate-45" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDrawer;

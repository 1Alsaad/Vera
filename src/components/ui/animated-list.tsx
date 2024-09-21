import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedList: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          when: "beforeChildren",
          staggerChildren: 0.3,
        },
      },
    }}
  >
    {React.Children.map(children, (child) => (
      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);
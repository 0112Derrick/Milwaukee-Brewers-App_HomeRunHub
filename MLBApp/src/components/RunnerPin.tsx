import { motion } from "framer-motion";
import { forwardRef } from "react";
import { RunnerPinProps } from "src/interfaces/baseballField.types";

export const RunnerPin = forwardRef<SVGGElement, RunnerPinProps>(
  ({ x, y, label, color = "#0ea5e9", isAnimating, delay = 0 }, ref) => {
    return (
      <motion.g
        ref={ref}
        initial={false}
        animate={{ x, y }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: "tween",
          duration: 0.38,
          ease: "easeInOut",
          delay: delay / 1000,
        }}
        style={{ transformOrigin: "center center" }}
      >
        <motion.circle
          r={6}
          fill={color}
          stroke="white"
          strokeWidth={2}
          initial={{ scale: 0.9, opacity: 0.95 }}
          animate={{ scale: isAnimating ? 1.08 : 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
        />
        {label ? (
          <motion.text
            x={0}
            y={2}
            textAnchor="middle"
            fontSize={7}
            fill="white"
            fontWeight="bold"
            style={{ userSelect: "none" }}
          >
            {label}
          </motion.text>
        ) : null}
      </motion.g>
    );
  }
);
RunnerPin.displayName = "RunnerPin";

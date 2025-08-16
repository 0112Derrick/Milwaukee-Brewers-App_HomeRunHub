import { motion } from "framer-motion";

export function RunnerPin({
  x,
  y,
  fromX,
  fromY,
  runnerId,
  color = "#0ea5e9",
  isAnimating = false,
}: {
  x: number;
  y: number;
  fromX?: number;
  fromY?: number;
  runnerId: string;
  color?: string;
  isAnimating?: boolean;
}) {
  return (
    <motion.g
      key={runnerId}
      initial={
        fromX !== undefined && fromY !== undefined
          ? { x: fromX, y: fromY, scale: 0.8, opacity: 0.9 }
          : { x, y, scale: 0.8, opacity: 0.9 }
      }
      animate={{
        x,
        y,
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0.6,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 15,
        duration: isAnimating ? 1.2 : 0.5,
      }}
    >
      <motion.circle
        cx={0}
        cy={0}
        r={6}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      {/* Runner number inside the pin */}
      <motion.text
        x={0}
        y={2}
        textAnchor="middle"
        fontSize={7}
        fill="white"
        fontWeight="bold"
        style={{ userSelect: "none" }}
      >
        {runnerId.slice(-1)} {/* Show last character of runner ID */}
      </motion.text>
    </motion.g>
  );
}

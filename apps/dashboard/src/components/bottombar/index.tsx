import { ChartArea } from "lucide-react";
import { motion } from "motion/react";

export default function BottomBar() {
  return (
    <motion.div className="fixed bottom-3 rounded-full border border-border bg-muted px-4 py-2">
      <ChartArea />
    </motion.div>
  );
}

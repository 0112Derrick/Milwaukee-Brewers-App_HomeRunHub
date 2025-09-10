import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "src/@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "src/@/components/ui/sheet"; // shadcn (Radix) Sheet

const HamburgerButton = ({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      aria-label="Toggle menu"
      aria-expanded={open}
      onClick={onToggle}
      className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      {/* 3 bars that animate into an X */}
      <motion.span
        className="absolute h-0.5 w-6 rounded bg-white"
        initial={false}
        animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
      <motion.span
        className="absolute h-0.5 w-6 rounded bg-white"
        initial={false}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className="absolute h-0.5 w-6 rounded bg-white"
        initial={false}
        animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </button>
  );
};

const MobileMenu = ({
  open,
  setOpen,
  onNavigate,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onNavigate: (path: string) => void;
}) => {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Slightly tinted overlay */}
      <SheetOverlay className="data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <SheetHeader className="sr-only">
        <SheetTitle>Mobile navigation</SheetTitle>
      </SheetHeader>
      <SheetContent
        side="right"
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed right-0 top-0 z-50 h-dvh w-[80vw] max-w-[420px] border-l border-white/10 bg-gray-900/80 backdrop-blur-xl p-6"
      >
        <div className="flex h-full flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Menu</span>
            <HamburgerButton open={open} onToggle={() => setOpen(false)} />
          </div>

          <nav className="mt-2 grid gap-3">
            <Button
              variant="ghost"
              className="justify-start text-base text-white hover:text-blue-300"
              onClick={() => {
                onNavigate("/home");
                setOpen(false);
              }}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-base text-white hover:text-blue-300"
              onClick={() => {
                onNavigate("/standings");
                setOpen(false);
              }}
            >
              Standings
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-base text-white hover:text-blue-300"
              onClick={() => {
                onNavigate("/scores");
                setOpen(false);
              }}
            >
              Scores
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-base text-white hover:text-blue-300"
              onClick={() => {
                onNavigate("/about");
                setOpen(false);
              }}
            >
              About
            </Button>
          </nav>

          <div className="mt-auto text-xs text-white/60">
            © {new Date().getFullYear()} Home Run Hub
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const NavBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="z-20 flex w-full min-h-fit flex-col overflow-hidden opacity-75 backdrop-blur-lg hover:opacity-95">
      <nav className="flex w-full items-center justify-between bg-gray-900 px-6 py-2 text-white">
        {/* Brand */}
        <div
          className="flex cursor-pointer items-center gap-2 text-xl font-bold"
          onClick={() => {
            navigate("/");
            window.scroll({ top: 0, left: 0, behavior: "smooth" });
          }}
        >
          <img
            className="h-12 scale-[2.5] rounded-full p-4 object-fill"
            src={process.env.PUBLIC_URL + "/images/baseballAppLogo.webp"}
            alt="Home Run Hub Logo"
          />
          <span className="cursor-pointer hover:text-white">Home Run Hub</span>
        </div>

        {/* Desktop actions */}
        <div className="hidden gap-2 lg:flex">
          <Button
            variant="default"
            className="cursor-pointer hover:text-blue-300"
            onClick={() => navigate("/standings")}
          >
            Standings
          </Button>
          <Button
            variant="default"
            className="cursor-pointer hover:text-blue-300"
            onClick={() => navigate("/scores")}
          >
            Scores
          </Button>
          <Button
            variant="default"
            className="cursor-pointer hover:text-blue-300"
            onClick={() => navigate("/about")}
          >
            About
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden">
          <HamburgerButton open={open} onToggle={() => setOpen((v) => !v)} />
        </div>
      </nav>
      <hr className="opacity-25" />

      {/* Mobile sheet */}
      <MobileMenu
        open={open}
        setOpen={setOpen}
        onNavigate={(path) => navigate(path)}
      />
    </div>
  );
};

export default NavBar;

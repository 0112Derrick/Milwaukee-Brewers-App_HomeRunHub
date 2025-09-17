import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "src/@/components/ui/input";
import { Card, CardContent } from "src/@/components/ui/card";
import { cn } from "src/@/lib/utils";

interface SearchableItem {
  id: string | number;
  name: string;
}

export function DropdownSearch({
  items,
  placeholder = "Search...",
}: {
  items: SearchableItem[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  // Filter items based on user input
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-md z-50">
      {/* Input box */}
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {/* Dropdown results */}
      <AnimatePresence>
        {query && filtered.length > 0 && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md z-50 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700"
          >
            {filtered.map((element) => (
              <Card
                key={element.id}
                className={cn(
                  "cursor-pointer rounded-none hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                )}
              >
                <CardContent className="p-3">
                  <Link
                    to={`/teams/${element.id}`}
                    className="block w-full text-left"
                    onClick={() => setQuery("")} // clear search on click
                  >
                    <div className="font-medium">{element.name}</div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

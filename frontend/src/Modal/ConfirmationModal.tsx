import { motion } from "framer-motion";

type Props = {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmationModal = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white py-5 px-4 rounded-xl w-full max-w-sm shadow-lg space-y-4 dark:text-white dark:bg-black dark:border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-white">{message}</p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-black cursor-pointer text-white rounded-md text-sm hover:bg-black/50 dark:bg-white dark:text-black"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

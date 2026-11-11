import * as Dialog from "@radix-ui/react-dialog";
import { useRef } from "react";
import type { ReactNode } from "react";
import { UtilityIcon } from "../../art/PostalArt";
export function PaperDialog({
  title,
  description,
  children,
  onClose,
  wide = false,
  initialFocus,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  initialFocus?: () => HTMLElement | null;
}) {
  const restore = useRef(document.activeElement as HTMLElement | null);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content
          className={`paper-dialog ${wide ? "wide" : ""}`}
          onOpenAutoFocus={(e) => {
            if (initialFocus) {
              e.preventDefault();
              initialFocus()?.focus();
            }
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (restore.current?.isConnected) restore.current.focus();
            else
              document
                .querySelector<HTMLElement>("main h1,main h2,main button")
                ?.focus();
          }}
        >
          <Dialog.Close
            className="icon-button dialog-close"
            aria-label="Close dialog"
          >
            <UtilityIcon kind="close" />
          </Dialog.Close>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          <div className="dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

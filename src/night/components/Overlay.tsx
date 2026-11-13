import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { useRef } from "react";
import { PixelIcon } from "./PixelIcon";
export function Overlay({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const returnTo = useRef(document.activeElement as HTMLElement | null);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="night-backdrop" />
        <Dialog.Content
          className="night-dialog"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (returnTo.current?.isConnected) returnTo.current.focus();
            else document.querySelector<HTMLElement>("main button")?.focus();
          }}
        >
          <Dialog.Close
            className="night-icon close-dialog"
            aria-label="Close dialog"
          >
            <PixelIcon name="close" />
          </Dialog.Close>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          <div className="night-dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

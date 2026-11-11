import * as Alert from "@radix-ui/react-alert-dialog";
export function ConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Alert.Root
      open
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <Alert.Portal>
        <Alert.Overlay className="modal-backdrop" />
        <Alert.Content className="paper-dialog">
          <Alert.Title>Clear this post office’s records?</Alert.Title>
          <Alert.Description>
            This removes saved shifts, streaks, collected stamps, and
            preferences from this browser. It cannot be undone.
          </Alert.Description>
          <div className="dialog-actions">
            <Alert.Cancel className="button secondary" onClick={onCancel}>
              Keep records
            </Alert.Cancel>
            <Alert.Action className="button danger" onClick={onConfirm}>
              Clear local records
            </Alert.Action>
          </div>
        </Alert.Content>
      </Alert.Portal>
    </Alert.Root>
  );
}

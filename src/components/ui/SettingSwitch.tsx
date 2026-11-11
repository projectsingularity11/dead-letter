import * as Switch from "@radix-ui/react-switch";
export function SettingSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      <Switch.Root
        className="switch"
        checked={checked}
        onCheckedChange={onChange}
      >
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </label>
  );
}

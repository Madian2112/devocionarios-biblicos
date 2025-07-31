import { BibleSelector3 } from "../bible-selector3";

export function VersiculoBibleSelector3({ 
  instanceId,
  onSelect, 
  currentReference, 
  trigger 
}: {
  instanceId: string;
  onSelect?: (reference: string) => void;
  currentReference?: string;
  trigger?: React.ReactNode;
}) {
  return (
    <BibleSelector3
      instanceId={instanceId}
      onSelect={onSelect ?? (() => {})}
      currentReference={currentReference}
      trigger={trigger}
    />
  );
}
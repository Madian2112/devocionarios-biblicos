import { BibleSelector } from "../bible-selector";

export function VersiculoBibleSelector2({ 
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
    <BibleSelector
      instanceId={instanceId}
      onSelect={onSelect ?? (() => {})}
      currentReference={currentReference}
      trigger={trigger}
    />
  );
}
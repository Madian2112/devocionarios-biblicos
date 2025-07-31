import { BibleSelector2 } from "../bible-selector2";

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
    <BibleSelector2
      instanceId={instanceId}
      onSelect={onSelect ?? (() => {})}
      currentReference={currentReference}
      trigger={trigger}
    />
  );
}
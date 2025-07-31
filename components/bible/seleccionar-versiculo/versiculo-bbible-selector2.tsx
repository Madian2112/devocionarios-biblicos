import { BibleSelector2 } from "../bible-selector2";

export function VersiculoBibleSelector2({ 
  instanceId,
  onSelect, 
  currentReference, 
  trigger,
  isOpen,
  onOpen,
  onClose
}: {
  instanceId: string;
  onSelect?: (reference: string) => void;
  currentReference?: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  return (
    <BibleSelector2
      instanceId={instanceId}
      onSelect={onSelect ?? (() => {})}
      currentReference={currentReference}
      trigger={trigger}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
    />
  );
}
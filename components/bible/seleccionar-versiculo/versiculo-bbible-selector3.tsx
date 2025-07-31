import { BibleSelector3 } from "../bible-selector3";

export function VersiculoBibleSelector3({ 
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
    <BibleSelector3
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
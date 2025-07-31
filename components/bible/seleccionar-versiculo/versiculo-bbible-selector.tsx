import { BibleSelector } from "../bible-selector";

export function VersiculoBibleSelector({ 
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
    <BibleSelector
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
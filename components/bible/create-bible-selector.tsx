import { BibleSelector, BibleSelectorProps } from "./bible-selector";

export function createBibleSelector(config: {
  instanceId: string;
  defaultReference?: string;
  triggerText?: string;
}) {
  return function ConfiguredBibleSelector({ 
    onSelect, 
    currentReference = config.defaultReference,
    trigger 
  }: Partial<BibleSelectorProps>) {
    return (
      <BibleSelector
        instanceId={config.instanceId}
        onSelect={onSelect || (() => {})}
        currentReference={currentReference}
        trigger={trigger || <button>{config.triggerText || "Abrir Biblia"}</button>}
      />
    );
  };
}
import React from 'react';
import { toast } from 'sonner';

// Components...
import { ToggleSetting } from './FormKit';

// Store / hooks...
import useFieldSettingStore from '../store/FieldSettingStore';
import useFormFieldSettings from '../hooks/useFormFieldSettings';

/**
 * The CHA on/off switch shown on both Invoice Settings and Challan Settings.
 * It is one shared value: flipping it on either page hides/shows the CHA field
 * on both Create Invoice and Create Challan. Saves immediately.
 */
const ChaVisibilitySetting = () => {
  const { showCha } = useFormFieldSettings();
  const saveShowCha = useFieldSettingStore((state) => state.saveShowCha);

  const handleChange = async (on) => {
    try {
      await saveShowCha(on);
      toast.success(on ? "CHA field is now shown." : "CHA field is now hidden.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save the CHA setting.");
    }
  };

  return (
    <ToggleSetting
      title="CHA Field"
      description="Show or hide the CHA field on Create Invoice and Create Challan."
      value={showCha}
      onChange={handleChange}
    />
  );
};

export default ChaVisibilitySetting;

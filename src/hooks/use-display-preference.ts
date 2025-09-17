import { useSettings, DisplayPreferences } from '@/contexts/SettingsContext';

export const useDisplayPreference = (section: keyof DisplayPreferences) => {
  const { settings } = useSettings();
  
  return {
    currentView: settings.displayPreferences[section],
    isTableView: settings.displayPreferences[section] === 'table',
    isCardsView: settings.displayPreferences[section] === 'cards'
  };
};

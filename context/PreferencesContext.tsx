import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Definição das chaves dos widgets disponíveis na Home
export type HomeWidgetType = 'summary' | 'actions' | 'recent_activity';

interface PreferencesContextType {
  visibleWidgets: Record<HomeWidgetType, boolean>;
  toggleWidget: (widget: HomeWidgetType) => void;
  isLoading: boolean;
}

const defaultPreferences: Record<HomeWidgetType, boolean> = {
  summary: true,
  actions: true, // Vamos ativar por padrão para mostrar a nova feature
  recent_activity: true,
};

const PreferencesContext = createContext<PreferencesContextType>({
  visibleWidgets: defaultPreferences,
  toggleWidget: () => {},
  isLoading: true,
});

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [visibleWidgets, setVisibleWidgets] = useState<Record<HomeWidgetType, boolean>>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferências salvas ao iniciar
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('@user_home_preferences');
      if (stored) {
        setVisibleWidgets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load preferences', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWidget = async (widget: HomeWidgetType) => {
    // Feedback tátil para melhor UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newPreferences = {
      ...visibleWidgets,
      [widget]: !visibleWidgets[widget],
    };

    setVisibleWidgets(newPreferences);

    try {
      await AsyncStorage.setItem('@user_home_preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save preferences', error);
    }
  };

  return (
    <PreferencesContext.Provider value={{ visibleWidgets, toggleWidget, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  );
};

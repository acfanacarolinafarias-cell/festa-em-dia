import { NativeTabs } from 'expo-router/native-tabs';

import { useColors } from '@/ui/theme';

export default function TabsLayout() {
  const c = useColors();
  return (
    <NativeTabs backgroundColor={c.surface} indicatorColor={c.accentSoft} labelStyle={{ selected: { color: c.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Meus eventos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="event" src={require('@/assets/images/tabIcons/home.png')} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="modelos">
        <NativeTabs.Trigger.Label>Modelos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'checklist', selected: 'checklist' }} md="checklist" src={require('@/assets/images/tabIcons/explore.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

import { useEffect } from 'react'
import './features/settings/locals/i18n'
import { useSettingsStore } from './features/settings/hooks/settingsStore'
import fontFamilies from './features/settings/utils/fontFamilies'
import { useAuthStore } from './features/auth/authStore'
import Routers from "./features/router/routes";
import PresenceConnection from "./features/presence/PresenceConnection";

const App = () => {
  const { theme, font, color } = useSettingsStore()
  const userId = useAuthStore((state) => state.user?.id)
  const loadForUser = useSettingsStore((state) => state.loadForUser)

  useEffect(() => {
    if (userId) loadForUser(userId).catch(() => undefined)
  }, [loadForUser, userId])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.appTheme = theme
    root.dataset.appColor = color
    root.style.setProperty('--app-font-family', fontFamilies[font] || fontFamilies.vazirmatn)
  }, [theme, font, color])

  return (
    <>
        <PresenceConnection />
        <Routers/>
    </>
  );
}
 
export default App;
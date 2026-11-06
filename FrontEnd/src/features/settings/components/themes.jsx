import { useTranslation } from "react-i18next"
import SettingsSection from "./settingSection"
import OptionButton from "./optionsBtn"
import { useSettingsStore } from "../hooks/settingsStore"
import {themeOptions} from '../utils/settingsOptions'

function Themes ({setPreference}){
    const {t} = useTranslation()
    const {theme} = useSettingsStore()
    return (
        <SettingsSection title={t('settings.appearance')} description={t('settings.appearanceDescription')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={theme === option}
                  onClick={() => setPreference('theme', option)}
                >
                  {t(`settings.themes.${option}`)}
                </OptionButton>
              ))}
            </div>
          </SettingsSection>
    )
}
export default Themes
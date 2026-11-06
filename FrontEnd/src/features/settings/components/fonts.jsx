import OptionButton from "./optionsBtn"
import SettingsSection from "./settingSection"
import {fontOptions} from '../utils/settingsOptions'
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "../hooks/settingsStore"
import fontFamilies from '../utils/fontFamilies'

function Fonts ({setPreference}){
    const {t} = useTranslation()
    const {font} = useSettingsStore()
    return (
        <SettingsSection title={t('settings.fonts')} description={t('settings.fontsDescription')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fontOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={font === option}
                  onClick={() => setPreference('font', option)}
                  style={{ fontFamily: fontFamilies[option] }}
                >
                  {t(`settings.fontsList.${option}`)}
                </OptionButton>
              ))}
            </div>
          </SettingsSection>
    )
}
export default Fonts
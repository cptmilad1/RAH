import { localizeText } from '../locals/localizedText.js'
import { useTranslation } from "react-i18next";
import OptionButton from "./optionsBtn";
import SettingsSection from "./settingSection";
import { useSettingsStore } from "../hooks/settingsStore";
import { languageOptions } from "../utils/settingsOptions";

function SelectLang({setPreference}){
    const {t} = useTranslation()
    const {language} = useSettingsStore()
    const changeLanguage = async (nextLanguage) => {
    await setPreference('language', nextLanguage)
  }
    return (
        <SettingsSection title={localizeText(t('settings.language'))} description={localizeText(t('settings.languageDescription'))}>
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={language === option}
                  onClick={() => changeLanguage(option)}
                >
                  {localizeText(t(`settings.languages.${option}`))}
                </OptionButton>
              ))}
            </div>
          </SettingsSection>
    )
}
export default SelectLang
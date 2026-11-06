import { localizeText } from '../locals/localizedText.js'
import { useTranslation } from "react-i18next"
import OptionButton from "./optionsBtn"
import SettingsSection from "./settingSection"
import { colorOptions } from "../utils/settingsOptions"
import colorSwatches from "../utils/colorSwatch"
import { useSettingsStore } from "../hooks/settingsStore"

function Colors ({setPreference}){
    const {t} = useTranslation()
    const {color} = useSettingsStore()
    return (
        <SettingsSection title={localizeText(t('settings.colors'))} description={localizeText(t('settings.colorsDescription'))}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {colorOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={color === option}
                  ariaLabel={t(`settings.colorsList.${option}`)}
                  onClick={() => setPreference('color', option)}
                >
                  <span className="flex items-center justify-between gap-3">
                    {localizeText(t(`settings.colorsList.${option}`))}
                    <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                      {colorSwatches[option].map((swatch) => (
                        <span
                          key={swatch}
                          className="size-5 rounded-full border-2 border-[var(--settings-surface)]"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </span>
                  </span>
                </OptionButton>
              ))}
            </div>
          </SettingsSection>
    )
}
export default Colors
import i18n from '../../settings/locals/i18n.js'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { taxiRequestSchema } from '../schema/taxiSchema'

function TaxiRequestForm({ vipFare, saving, onSubmit }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taxiRequestSchema),
    defaultValues: { pickupAddress: '', destinationAddress: '', taxiType: 'standard', proposedFare: '', note: '' },
  })
  const taxiType = useWatch({ control, name: 'taxiType' })

  async function submitRequest(values) {
    const payload = {
      pickupAddress: values.pickupAddress,
      destinationAddress: values.destinationAddress,
      taxiType: values.taxiType,
      note: values.note || '',
      ...(values.taxiType === 'standard' ? { proposedFare: values.proposedFare } : {}),
    }
    const created = await onSubmit(payload)
    if (created) reset()
  }

  return (
    <form onSubmit={handleSubmit(submitRequest)} className="grid gap-4 border-y border-[#dfe8df] py-6">
      <div>
        <p className="m-0 text-xs font-bold text-[#71867c]">{i18n.t('taxi.request.eyebrow')}</p>
        <h2 className="mb-0 mt-1 text-lg font-extrabold">{i18n.t('taxi.request.title')}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold text-[#66776d]">
          {i18n.t('taxi.pickup')}
          <input {...register('pickupAddress')} maxLength={500} placeholder={i18n.t('taxi.pickupPlaceholder')} className="min-h-11 rounded-xl border border-[#dfe8df] bg-white px-3 text-sm font-normal text-[#17352e]" />
          {errors.pickupAddress && <span role="alert" className="text-[#a94f3d]">{i18n.t(errors.pickupAddress.message)}</span>}
        </label>
        <label className="grid gap-2 text-xs font-bold text-[#66776d]">
          {i18n.t('taxi.destination')}
          <input {...register('destinationAddress')} maxLength={500} placeholder={i18n.t('taxi.destinationPlaceholder')} className="min-h-11 rounded-xl border border-[#dfe8df] bg-white px-3 text-sm font-normal text-[#17352e]" />
          {errors.destinationAddress && <span role="alert" className="text-[#a94f3d]">{i18n.t(errors.destinationAddress.message)}</span>}
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold text-[#66776d]">
          {i18n.t('taxi.type')}
          <select {...register('taxiType')} className="min-h-11 rounded-xl border border-[#dfe8df] bg-white px-3 text-sm font-normal text-[#17352e]">
            <option value="standard">{i18n.t('taxi.type.standard')}</option>
            <option value="vip">{i18n.t('taxi.type.vip')}</option>
          </select>
        </label>
        {taxiType === 'standard' ? (
          <label className="grid gap-2 text-xs font-bold text-[#66776d]">
            {i18n.t('taxi.proposedFare')}
            <input {...register('proposedFare', { valueAsNumber: true })} type="number" min="1" step="1" inputMode="numeric" placeholder={i18n.t('taxi.farePlaceholder')} className="min-h-11 rounded-xl border border-[#dfe8df] bg-white px-3 text-sm font-normal text-[#17352e]" />
            {errors.proposedFare && <span role="alert" className="text-[#a94f3d]">{i18n.t(errors.proposedFare.message)}</span>}
          </label>
        ) : (
          <div className="grid content-center gap-1 rounded-xl bg-[#f0f4eb] px-4 py-2 text-xs text-[#66776d]">
            <span>{i18n.t('taxi.fixedFare')}</span>
            <strong className="text-base text-[#17352e]">{Number(vipFare).toLocaleString(i18n.language)} AFN</strong>
          </div>
        )}
      </div>
      <label className="grid gap-2 text-xs font-bold text-[#66776d]">
        {i18n.t('taxi.note')}
        <textarea {...register('note')} rows={2} maxLength={1000} placeholder={i18n.t('taxi.notePlaceholder')} className="resize-y rounded-xl border border-[#dfe8df] bg-white px-3 py-2.5 text-sm font-normal text-[#17352e]" />
      </label>
      <button disabled={saving} type="submit" className="min-h-11 justify-self-start rounded-xl bg-[#173f32] px-5 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60">
        {i18n.t(saving ? 'taxi.request.submitting' : 'taxi.request.submit')}
      </button>
    </form>
  )
}

export default TaxiRequestForm
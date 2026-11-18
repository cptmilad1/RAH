import i18n from '../../settings/locals/i18n.js'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { taxiRatingSchema } from '../schema/taxiSchema'

function TaxiRatingForm({ saving, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taxiRatingSchema),
    defaultValues: { score: 5, comment: '' },
  })

  async function submitRating(values) {
    const saved = await onSubmit(values)
    if (saved) reset()
  }

  return (
    <form onSubmit={handleSubmit(submitRating)} className="mt-4 grid gap-3 border-t border-[#e7ece5] pt-4 sm:grid-cols-[minmax(120px,0.35fr)_minmax(0,1fr)_auto] sm:items-end">
      <label className="grid gap-2 text-xs font-bold text-[#66776d]">
        {i18n.t('taxi.rating.score')}
        <select {...register('score', { valueAsNumber: true })} className="min-h-10 rounded-lg border border-[#dfe8df] bg-white px-3 text-sm">
          {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} / 5</option>)}
        </select>
        {errors.score && <span role="alert" className="text-[#a94f3d]">{i18n.t(errors.score.message)}</span>}
      </label>
      <label className="grid gap-2 text-xs font-bold text-[#66776d]">
        {i18n.t('taxi.rating.comment')}
        <input {...register('comment')} maxLength={500} placeholder={i18n.t('taxi.rating.commentPlaceholder')} className="min-h-10 rounded-lg border border-[#dfe8df] bg-white px-3 text-sm font-normal" />
        {errors.comment && <span role="alert" className="text-[#a94f3d]">{i18n.t(errors.comment.message)}</span>}
      </label>
      <button disabled={saving} type="submit" className="min-h-10 rounded-lg bg-[#315d49] px-4 text-xs font-extrabold text-white disabled:opacity-60">{i18n.t('taxi.rating.submit')}</button>
    </form>
  )
}

export default TaxiRatingForm
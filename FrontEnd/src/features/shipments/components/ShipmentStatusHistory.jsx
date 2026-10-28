import { statusLabels } from '../shipmentConstants'

function ShipmentStatusHistory({ history }) {
  return (
    <section className="mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-5 sm:p-7">
      <h2 className="m-0 text-lg font-extrabold">مراحل مرسوله</h2>
      <ol className="mt-5 grid list-none gap-5 p-0">
        {history.map((item, index) => (
          <li key={`${item.status}-${item.createdAt}`} className="flex gap-3">
            <span className={`mt-1 grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${index === 0 ? 'bg-[#eaf4d6] text-[#567640]' : 'bg-[#f2f4ef] text-[#89958d]'}`}>{index === 0 ? '✓' : '·'}</span>
            <div>
              <strong className="text-sm">{statusLabels[item.status] || item.status}</strong>
              {item.note && <p className="mb-0 mt-1 text-xs leading-6 text-[#7b8982]">{item.note}</p>}
              <time className="mt-1 block text-[10px] text-[#9aa49e]">{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default ShipmentStatusHistory

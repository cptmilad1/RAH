import TabsUtil from "../utils/tabs";

function Tabs({activeTab, setActiveTab, users}){
      const tabs = TabsUtil(users)
    return (
        <div role="tablist" aria-label="دسته‌بندی کاربران" className="flex gap-2 overflow-x-auto border-b border-[#edf0eb] px-4 py-3 sm:px-6">
            {tabs.map((tab) => <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${activeTab === tab.id ? 'bg-[#eaf2df] text-[#315946]' : 'text-[#829188] hover:bg-[#f7f9f4] hover:text-[#315946]'}`}
            >
              {tab.label}<span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px]">{tab.count(users)}</span>
            </button>)}
          </div>
    )
}
export default Tabs;
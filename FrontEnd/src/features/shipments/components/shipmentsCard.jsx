import { localizeText } from '../../settings/locals/localizedText.js'
import Card from "../../../global/Card"
import { useShipmentPage } from "../hooks/useShipmentPage"
import ShipmentFilters from "./ShipmentFilters"
import ShipmentList from "./ShipmentList"


function ShipmentCards({ user, openCreateDialog }) {
      const page = useShipmentPage()
        function openCancelDialog(shipment) {
            page.setCancelTarget(shipment)
            page.setCancelError('')
            page.setCancelReason('')
        }
    return (
        <Card as="section" aria-label={localizeText("فهرست مرسوله‌ها")} variant="unstyled" className="overflow-hidden rounded-[24px] border border-[#e5ebe3] bg-white/90 shadow-[0_18px_52px_rgba(22,57,43,.055)]">
            <ShipmentFilters
                activeFilter={page.activeFilter}
                onFilterChange={page.setActiveFilter}
                search={page.search}
                onSearchChange={page.setSearch}
            />
            <ShipmentList
                shipments={page.filteredShipments}
                allShipments={page.shipments}
                loading={page.loading}
                error={localizeText(page.error)}
                onRetry={page.fetchShipments}
                onCreate={openCreateDialog}
                user={user}
                onCancel={openCancelDialog}
            />
        </Card>
    )
}
export default ShipmentCards
import { useAuth } from "../auth/authStore"
import NavbarSide from "../dashboard/components/NavbarSide"
import navBarItems from "../dashboard/utils/navItems"
import { usePresenceStore } from "../presence/presenceStore"

function Layout({children}){
    const {unreadDirectMessages} = usePresenceStore()
    const {user,logout} = useAuth()
    const navItems = navBarItems(user, unreadDirectMessages, logout)
    return(
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
            <NavbarSide logout={logout} navItems={navItems}/>
            <div className="min-w-0 flex-1">
                {children}
            </div>
        </div>
    )
}
export default Layout
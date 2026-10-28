import {create} from 'zustand'
import request from './api'
import { usePresenceStore } from '../../presence/presenceStore'

const useUser = create((set) => ({
    isUser : false,
    isAdmin : false,
    isDriver: false,
    isOnline : false,
    presenceUserId: null,
    setRole : async(id)=>{
        const response = await request(`profile/${id}`,{method: "GET"})
        response.data.role.toLowerCase() == "admin" 
        ? set({isAdmin : true}) 
        : response.data.role.toLowerCase() == "driver" 
        ? set({isDriver : true}) 
        : set({isUser : true})
    },
    setIsOnline: (id)=>{
        const presenceUserId = String(id)
        set({
            presenceUserId,
            isOnline: Boolean(usePresenceStore.getState().onlineUsers[presenceUserId]),
        })
    }
}))

usePresenceStore.subscribe((state) => {
    const presenceUserId = useUser.getState().presenceUserId
    if (presenceUserId) {
        useUser.setState({ isOnline: Boolean(state.onlineUsers[presenceUserId]) })
    }
})

export default useUser;
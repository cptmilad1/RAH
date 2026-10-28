import {create} from 'zustand'
import request from './api'

const useUser = create((set) => ({
    isUser : false,
    isAdmin : false,
    isDriver: false,
    isOnline : false,
    setRole : async(id)=>{
        const response = await request(`profile/${id}`,{method: "GET"})
        response.data.role.toLowerCase() == "admin" 
        ? set({isAdmin : true}) 
        : response.data.role.toLowerCase() == "driver" 
        ? set({isDriver : true}) 
        : set({isUser : true})
    },
    setIsOnline: async(id)=>{
        const response = await request(`profile/${id}`,{method: "GET"})
        response.data.is_active ? set({ isOnline : true }) : set({ isOnline : false })
    }
}))

export default useUser;
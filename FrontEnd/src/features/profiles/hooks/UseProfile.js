import { create } from "zustand";
import request from "../../store/hooks/api";
import { updateProfile } from "../../auth/authApi";
import { useAuthStore } from "../../auth/authStore";

const useProfile = create((set)=>({
    users : null,
    setUsers : async(id)=>{
        const getProfile = await request(`profile/${id}`, {method: "GET"})
        set({users : getProfile.data})
        return getProfile.data
    },
    updateUser : async(id, profileData)=>{
        const result = await updateProfile(id, profileData)
        set({users : result.data})

        const currentUser = useAuthStore.getState().user
        if (String(currentUser?.id) === String(id)) {
            useAuthStore.getState().setUser({ ...currentUser, ...result.data })
        }

        return result.data
    }
}))
export default useProfile;
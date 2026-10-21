import { create } from "zustand";
import request from "../../store/hooks/api";

const useProfile = create((set)=>({
    users : null,
    setUsers : async(id)=>{
        try{
            const getProfile = await request(`profile/${id}`, {method: "GET"})
            set({users : getProfile.data})
        }catch(err){
            console.log(err)
        }
    }
}))
export default useProfile;
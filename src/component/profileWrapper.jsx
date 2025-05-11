import React, { useEffect, useState } from "react";
import Profile from "./profile.jsx";
import axiosInstance from "./utility";
const ProfileWrapper = () => {
    const [user, setUser] = useState({})

    const fetchProfile = async () => {
        try {
          let response = await axiosInstance.get("/profile/");
          setUser(response.data);
        } catch {
           console.log("unable to fetch profile");
        }
                  
    }
    useEffect(() =>{
       fetchProfile();
    }, []);
    return (
       <div>
           <Profile user={user} />
       </div>
    )
}

export default ProfileWrapper;

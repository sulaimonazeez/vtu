import React from "react";
import Profile from "./profile.jsx";

const ProfileWrapper = () => {
    const user = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678'
    };
    return (
       <div>
           <Profile user={user} />
       </div>
    )
}

export default ProfileWrapper;

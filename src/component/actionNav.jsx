import React from "react";
import { useNavigate } from "react-router-dom";

const Actions = () => {
    const navigate = useNavigate();

    const Navigators = (link) => {
      navigate(link)
    }
    
    return(
        <section className="quick-action">
            <h5>Quick Action</h5>
            <div className="quickly-flex">
            <div onClick={ ()=> navigate("/airtime")} className="flx" id="airtime">
                <div><i class="fa fa-phone"></i></div>
                <p>Airtime</p>
            </div>
            <div onClick={ ()=> navigate("/data")} className="flx data" id="data">
                <div><i className="fa fa-mobile-phone"></i></div>
                <p>Data</p>
            </div>
            <div onClick={ ()=> navigate("/cable")} className="flx sm" id="laptop">
                <div><i className="fa fa-laptop"></i></div>
                <p>Cable Tv</p>
            </div>
            <div onClick={ ()=> navigate("/reffer")} className="flx sm" id="refferal">
                <div><i className="fa fa-users"></i></div>
                <p>Refferals</p>
            </div>
            <div onClick={ ()=> navigate("/all")} className="flx usr" id="service">
                <div><i class="fa fa-th"></i></div>
                <p>All Services</p>
            </div>
            </div>
      </section>
    )
}


export default Actions;
import React, { useEffect, useState } from "react";
import axiosInstance from "./utility";
import { useNavigate } from "react-router-dom";
import "./css/home.css";
import { Link } from "react-router-dom";

const Transaction = () => {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getHistory = async () => {
            try {
                const accessToken = localStorage.getItem("access_token");
        
                if (!accessToken) {
                    console.error("No access token found, redirecting to login.");
                    navigate("/login");
                    return;
                }

                const response = await axiosInstance.get("/history/", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                setHistory(response.data);
            } catch (e) {
                console.error("Error fetching history:", e);
            }
        };

        getHistory();
    }, [navigate]);

    return (
        <div>
        <section className="recent-transaction p-1">
            <div className="recent-header">
                <h5 style={{ fontSize: '16px' }} className="mt-2 p-3"><strong>Recent Transactions</strong></h5>
                <a href="/history">see all</a>
            </div>

            {history.map((data) => {
                return (
                    <Link to={`/history/${data.id}`} className="cbg" key={data.id}>
                        <div className="mobile p-4 rounded-pill"><i className="fa fa-mobile"></i></div>
                        <div className="tb">
                            <h5 style={{ fontSize: "15px", marginTop: "1.2rem" }}><strong>{["airtel", "mtn", "glo", "9mobile"].includes(data.data_plan) ? "Airtime Topup" : "Data Topup"}</strong></h5>
                            <small>{data.message}</small>
                        </div>
                        <div style={{lineHeight:1}} className="tb success">
                            <p>{data.status}</p>
                            <h5 style={{ fontSize: '13px', fontWeight: 'bold'}}>NGN{data.amount}</h5>
                            <small style={{ position: 'relative', top: '-0.5rem'}}>{data.date}</small>
                        </div>
                    </Link>
                );
            })}
        </section><br/><br /><br /> <br />
        </div>
    );
}

export default Transaction;

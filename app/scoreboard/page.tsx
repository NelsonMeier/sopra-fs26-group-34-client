"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";

const Scoreboard: React.FC = () => {
    const router = useRouter();
    const { value: userId } = useLocalStorage<string>("userId", "");


    return(
        <div style={{
            minHeight: '100vh', 
            display: 'flex',
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", 
            backgroundColor: '#77B8D2', 
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', 
            overflow: 'hidden', 
            outline: '3px black solid',
            outlineOffset: '-1.50px'}}>
        <div data-layer="Scoreboard Page" className="Scoreboard Page" style={{width: "min(1100px, 100%)", display: "grid", gridTemplateRows: "auto auto auto", rowGap: "28px", paddingTop: "28px", paddingBottom: "24px", background: '#77B8D2'}}>
              <div data-layer="Header" className="Header" style={{display: "grid", gridTemplateColumns: "220px 1fr 260px", alignItems: "center", columnGap: "24px"}}>
                <div style={{ width: "220px" }} />
                <div style={{
                    textAlign: 'center', 
                    justifyContent: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    color: 'black', 
                    fontSize: 64, 
                    fontFamily: 'Gluten', 
                    fontWeight: '400', 
                    wordWrap: 'break-word'}}>Scoreboard</div>
                
                <div data-layer="Back Button" className="Back Button" style={{
                    width: '200px', 
                    height: '55px', 
                    justifySelf: "end",
                    background: '#FBAB7A', 
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', 
                    borderRadius: 25, 
                    border: '1px #FBAB7A solid'}} onClick={() => router.push(userId ? `/users/${userId}` : "/users")}>Back</div> 
              </div>
              <div data-layer="Middle" className="Middle" style={{display: "grid", marginTop: "50px",gridTemplateColumns: "1fr 260px", alignItems: "start"}}>


              </div>
    </div>
    </div>
    );
};

export default Scoreboard;
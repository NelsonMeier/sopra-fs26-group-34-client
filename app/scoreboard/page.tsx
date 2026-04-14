"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { Button } from "antd"

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
                
                <Button data-layer="Back Button" className="Back Button" style={{
                    width: '200px', 
                    height: '55px', 
                    justifySelf: "end",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                    fontSize: 32,
                    fontFamily: 'Gluten',
                    fontWeight: '400',
                    background: '#FBAB7A', 
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', 
                    borderRadius: 25, 
                    border: '1px #FBAB7A solid'}} onClick={() => router.push(userId ? `/users/${userId}` : "/users")}>Back</Button> 
              </div>
                            <div data-layer="Middle" className="Middle" style={{display: "grid", marginTop: "50px", rowGap: "14px"}}>
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center"}}>
                                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 36, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Reaction Time</div>
                                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 36, fontFamily: 'Gluten', fontWeight: '400', wordWrap: 'break-word'}}>Typing Test</div>
                                </div>

                                <div style={{width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '40px'}}>
                                    <div style={{minHeight: '578px', background: '#ACCEDC', borderRadius: 10, padding: '35px 24px'}} >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 36, fontFamily: 'Gluten'}}>Record Holders Coming Soon</div>
                                        </div>
                                    <div style={{minHeight: '578px', background: '#ACCEDC', borderRadius: 10, padding: '35px 24px'}} >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: '#2f4f5a', fontSize: 36, fontFamily: 'Gluten'}}>Record Holders Coming Soon</div>
                                    </div>
                                </div>
                            </div>
    </div>
    </div>
    );
};

export default Scoreboard;
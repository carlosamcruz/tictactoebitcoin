
import React, { useRef } from 'react';

function TitleBar(props : any) {

    const amountRef = useRef<any>(null);
    const resumeTxid = useRef<any>(null);

    const onStart = async () => {

        let amount = parseInt(amountRef.current.value);

        //if (amount < 50000) {
        if (amount < 1000) {    
            alert("invalid amount, at least 50000 satoshis")
            return;
        }

        if (!isNaN(amount)) {


            props.onStart(amount);
        } else {
            console.error(`${amountRef.current.value} is not number`)
        }
    }

    const onCancel = () => {
        props.onCancel();
    }




    const onResume = async () => {

        
        //if (amount < 50000) {
        if (resumeTxid.current.value.length !== 64) {    
            alert("Invalid TXID")
            return;
        }


        if (resumeTxid.current.value.length === 64) {

            props.onStart(resumeTxid.current.value)


            //props.onStart(amount);
        } else {
            console.error(`${amountRef.current.value} is not number`)
        }
    }



    if (props.started) {
        return (
            <div>
                The game is in progress ...
                <button 
                    className="pure-button cancel" onClick={onCancel}
                    style={{ fontSize: '20px', paddingTop: '1px', paddingBottom: '1px'}}
                    >Restart</button>
            </div>
        );
    } else {
        return (
            <div>
                <label style={{ fontSize: '20px', paddingBottom: '2px', paddingTop: '2px'}}
                >Bet amount:
                    <input ref={amountRef} type="number" name="amount" min="1" defaultValue={2000} placeholder="in satoshis" />
                </label>
                <button 
                    className="start button-small" onClick={onStart}
                    style={{ fontSize: '20px', paddingTop: '1px', paddingBottom: '1px', marginLeft: '5px'}}
                    >Start</button>

                <div style={{ display: 'block', fontSize: '20px', paddingBottom: '2px', paddingTop: '2px' }}>
                    <label>Resume Game:
                        <input ref={resumeTxid} type="string" name="amount" min="1" defaultValue={'Last state Txid'} placeholder="in satoshis" />
                    </label>
                    <button 
                    style={{ marginLeft: '5px'}}
                    className="resume" onClick={onResume}
                    >Resume</button>
                </div>

            </div>
        );
    }
}

export default TitleBar;

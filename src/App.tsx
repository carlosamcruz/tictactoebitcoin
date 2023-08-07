import "./App.css";
import Game from "./Game";
import { useState, useRef, useEffect } from "react";
import TitleBar from "./TitleBar";
import { DefaultProvider, SensiletSigner, toHex, PubKey, bsv, TestWallet, Tx } from "scrypt-ts";
import { TicTacToe } from "./contracts/ticTacToe";
import { Console } from "console";
import { GameData, SquareData } from "./types";

const initialGameData = {
  amount: 0,
  name: "tic-tac-toe",
  date: new Date(),
  history: [
    {
      squares: Array(9).fill(null),
    },
  ],
  currentStepNumber: 0,
  isAliceTurn: true,
  start: false,
  currentTXID: '',
  pvtKeyAlice: '',
  pvtKeyBob: '',
  pvtKeySignee: ''

}

function App() {

  const [gameData, setGameData] = useState(initialGameData);
  const [isConnected, setConnected] = useState(false);
  const [isPVTKEY, setispvtkey] = useState(false);
  const [isPVTKEYinsert, setispvtkeyInsert] = useState(false);
  //const signerRef = useRef<SensiletSigner>();
  const [signerRef0, setsignerRef0] = useState<TestWallet>();
  const signerRef = useRef<TestWallet>();
  const signerRef2 = useRef<SensiletSigner>();
  const [currentTXID, setTxid] = useState("");
  const [contract, setContract] = useState<TicTacToe | undefined>(undefined)
  //const [deployedTxId, setDeployedTxId] = useState<string>("")
  //const [alicePubkey, setAlicePubkey] = useState("");
  const [alicePubkey, setAlicePubkey] = useState<bsv.PublicKey>();
  //const [bobPubkey, setBobPubkey] = useState("");
  const [bobPubkey, setBobPubkey] = useState<bsv.PublicKey>();
  const [alicebalance, setAliceBalance] = useState(0);
  const [bobbalance, setBobBalance] = useState(0);

  const startGame = async (amount: any) => {

    privateKey2 = bsv.PrivateKey.fromHex(alicepvtstr, bsv.Networks.testnet)
    privateKey3 = bsv.PrivateKey.fromHex(bobpvtstr, bsv.Networks.testnet)

    Alice = new TestWallet(privateKey2, provider)
    Bob = new TestWallet(privateKey3, provider)

    signAlice?  signerExt = Alice: signerExt = Bob


    if (!isConnected || !alicePubkey || !bobPubkey) {
      setConnected(false)
      alert("Please connect wallet first.")
      return
    }


    try {

      const signer = signerExt

      //await TicTacToe.compile() // não precisa aqui 
      
      const instance = new TicTacToe(
        PubKey(toHex(alicePubkey)),
        PubKey(toHex(bobPubkey))
      )
      
      await instance.connect(signer);
      
      signAlice?
        console.log('PBK Alice:', PubKey(toHex(alicePubkey)))
        : console.log('PBK Bob:', PubKey(toHex(bobPubkey)))
      //console.log('TXIDxx:', bsv.Transaction((deployedTxId)))

      
      let tx3 = new bsv.Transaction;


      if(amount.length === 64)
      {
        tx3 = await provider.getTransaction(amount);
        console.log('RESUME TXID: ', tx3.id)
      }
      else
      {
        let deployedTxId = await instance.deploy(amount);
        tx3 = await provider.getTransaction(deployedTxId.id);
        console.log('TXID DEPLOY:', tx3.id)
      }

      initialGameData.currentTXID = tx3.id;
      const current = TicTacToe.fromTx(tx3, 0);

      //Quem vai assinar?
      current.is_alice_turn? signerExt = Alice: signerExt = Bob


      setContract(current)

      //setTxid(tx3.id)

      let signeePVTKEY = signAlice?  alicepvtstr: bobpvtstr
  

      setGameData(Object.assign({}, gameData, {
        start: true,
        //history: current.board,
        currentTXID: tx3.id,

        pvtKeyAlice: alicepvtstr,
        pvtKeyBob: bobpvtstr,
        pvtKeySignee: signeePVTKEY

      }))

      if(amount.length === 64)
      {
        await gameResume(current)
      }

    } catch (e) {
      console.error('deploy TicTacToe failes', e)
      alert('deploy TicTacToe failes')
    }
  };

  
  
  async function gameResume(instance: TicTacToe) 
  {

    //Falta verificar de quem é a proxima rodada
    //Verificar o próximo jogador a partir da instancia

    let n = 1
    let history = gameData.history.slice(0, n + 1);
    let current = history[history.length - 1];
    let squares = current.squares.slice();

    let gameData2 = gameData as GameData;
    let setGameData2 = setGameData;
  
    for(let i =0; i < 9; i++)
    {
        if(instance.board[i] !== 0n)
        {
          n = n + 1;

          history = gameData2.history.slice(0, n);
          current = history[history.length - 1];
          squares = current.squares.slice();
     
          squares[i] = {
            label: instance.board[i] === 1n ? 'X' : 'O',
            n: history.length,
            
          };

          let signeePVTKEY = signAlice?  alicepvtstr: bobpvtstr

          gameData2 = {  
            ...gameData2,
            history: history.concat([
              {
                squares
              },
            ]),
            //isAliceTurn: winner ? gameData.isAliceTurn : !gameData.isAliceTurn,
            isAliceTurn: instance.is_alice_turn,
            currentStepNumber: history.length,
            start: true,
            pvtKeyAlice: alicepvtstr,
            pvtKeyBob: bobpvtstr,
            pvtKeySignee: signeePVTKEY
                
          }
                   
          const square = squares[i] as SquareData;
          if(square) {
            square.tx = gameData.currentTXID;
          }
  
          // update states
          setGameData2(gameData2)
        }
    }
  }


  const startGameGOOD = async (amount: number) => {

    //console.log('Alice PBK KEY:', ((alicePubkey)))

    if (!isConnected || !alicePubkey || !bobPubkey) {
      setConnected(false)
      alert("Please connect wallet first. ABC")
      return
    }

    //alert("Good.")

    try {

      const signer = signerExt

      //await TicTacToe.compile() // não precisa aqui 
      
      const instance = new TicTacToe(
        PubKey(toHex(alicePubkey)),
        PubKey(toHex(bobPubkey))
      )
      
      await instance.connect(signer);
      
      const tx = await instance.deploy(amount);

 //     setDeployedTxId(tx.id)

      console.log('TXID:', tx.id)

      setContract(instance)

      setGameData(Object.assign({}, gameData, {
        start: true
      }))

    } catch (e) {
      console.error('deploy TicTacToe failes', e)
      alert('deploy TicTacToe failes')
    }
  };

  const cancelGame = async () => {
    setGameData(Object.assign({}, gameData, initialGameData))
  };

  let privateKey2: bsv.PrivateKey
  let privateKey3: bsv.PrivateKey

  const provider = new DefaultProvider({network: bsv.Networks.testnet});

  let Alice: TestWallet
  let Bob: TestWallet
  
  let signerExt: TestWallet

  const pvtKeysLogin = async () => {

    let privateKeyExt: bsv.PrivateKey;

    privateKey2 = bsv.PrivateKey.fromHex(alicepvtstr, bsv.Networks.testnet)
    privateKey3 = bsv.PrivateKey.fromHex(bobpvtstr, bsv.Networks.testnet)

    Alice = new TestWallet(privateKey2, provider)
    Bob = new TestWallet(privateKey3, provider)
   
    if(signAlice)
    {
      signerExt = Alice
      privateKeyExt = privateKey2
      //otherprivateKeyExt = privateKey3 
    }
    else
    {
      signerExt = Bob
      privateKeyExt = privateKey3
      //otherprivateKeyExt = privateKey2
    }

    try {

      signerRef.current = signerExt;

      setsignerRef0(signerExt)

      //await signerExt.connect()
     
      //const { isAuthenticated, error } = await signerExt.requestAuth()
      const { isAuthenticated} = await signerExt.connect()
      if (!isAuthenticated) {
        //throw new Error(error)
        throw new Error('Connection Error')
      }

      setConnected(true);

      const alicPubkey = await signerExt.getDefaultPubKey();

      //setAlicePubkey(toHex(alicPubkey))
      //setAlicePubkey((alicPubkey)); //preciou desta mudança
      setAlicePubkey(bsv.PublicKey.fromPrivateKey(privateKey2))
      
      //setBobPubkey(toHex(bsv.PublicKey.fromPrivateKey(privateKey3)))
      //setBobPubkey(bsv.PublicKey.fromPrivateKey(privateKeyExt)) ////preciou desta mudança
      setBobPubkey(bsv.PublicKey.fromPrivateKey(privateKey3))
      

      //console.log('Signee PBK KEY:', alicPubkey)
      //console.log('Alice PBK KEY:', setAlicePubkey(toHex(alicPubkey)))
      console.log('\n\n\nSignee PBK KEY:', (toHex(alicPubkey)))
      console.log('Signee ADRRESS:', bsv.Address.fromPrivateKey(privateKeyExt).toString())

     // signerExt.getBalance(bsv.Address.fromPrivateKey(privateKey3))

      await signerExt.getBalance(bsv.Address.fromPrivateKey(privateKeyExt)).then(balance => {
        // UTXOs belonging to transactions in the mempool are unconfirmed
        setAliceBalance(balance.confirmed + balance.unconfirmed)
      })

      // Prompt user to switch accounts

    } catch (error) {
      //console.error("sensiletLogin failed", error);
      console.error("PVT KEY failed", error);
      //alert("sensiletLogin failed")
      alert("PVT KEY failed")
    }
  };


  
  const sensiletLogin = async () => {
    try {

      const provider = new DefaultProvider();
      const signer = new SensiletSigner(provider);

      signerRef2.current = signer;

      const { isAuthenticated, error } = await signer.requestAuth()
      if (!isAuthenticated) {
        throw new Error(error)
      }

      setConnected(true);

      const alicPubkey = await signer.getDefaultPubKey();
      //setAlicePubkey(toHex(alicPubkey))
      setAlicePubkey((alicPubkey))

      signer.getBalance().then(balance => {
        // UTXOs belonging to transactions in the mempool are unconfirmed
        setAliceBalance(balance.confirmed + balance.unconfirmed)
      })

      // Prompt user to switch accounts

    } catch (error) {
      console.error("sensiletLogin failed", error);
      alert("sensiletLogin failed")
    }
  };

  const alicepvtkey = useRef<any>(null);
  const bobpvtkey = useRef<any>(null);

  //Endereços para serem impressos na UI
  const [aliceadd, setaliceadd] = useState("");
  const [bobadd, setbobadd] = useState("");

  const pvtKeyPlace = async () => {

    //console.log('Alice PBK KEY:', ((alicePubkey)))
    setispvtkey(true)

  };
  
  //PVT KEYS string
  const [alicepvtstr, setalicepvtstr] = useState("");
  const [bobpvtstr, setbobpvtstr] = useState("");
  const [signAlice, setisignAlice] = useState(false);
  const [bobsignInit, setbobsignInit] = useState(false);

  const pvtKeyTestBob = async () => 
  {
    setisignAlice(false)
    setbobsignInit(true)

  };

  const pvtKeyTestAlice = async () => 
  {
    setisignAlice(true)
  };


  //Somente chama a função depois que o estado muda
  useEffect(() => {

    if(isPVTKEYinsert)
    {
      pvtKeysLogin(); 
    }

  }, [signAlice]);

  useEffect(() => {

    if(isPVTKEYinsert)
    {
      pvtKeysLogin();
      
    }

  }, [bobsignInit]);
  

  const pvtKeyTest = async () => {

    //console.log('Alice PBK KEY:', ((alicePubkey)))
    if(alicepvtkey.current.value.length === 64 && bobpvtkey.current.value.length === 64)
    {
      setbobpvtstr(bobpvtkey.current.value)
      setalicepvtstr(alicepvtkey.current.value)
 
      //Necessário para colocar o endereco na UI
      privateKey2 = bsv.PrivateKey.fromHex(alicepvtkey.current.value, bsv.Networks.testnet)
      privateKey3 = bsv.PrivateKey.fromHex(bobpvtkey.current.value, bsv.Networks.testnet)
  
      setaliceadd( bsv.Address.fromPrivateKey(privateKey2).toString())
      setbobadd( bsv.Address.fromPrivateKey(privateKey3).toString())

      setispvtkeyInsert(true)
    }
    else{
      alert("Indique as duas chaves corretamente.")
    }

  };


  return (
    <div className="App">
      <header className="App-header">
        <h2 style={{ fontSize: '34px', paddingBottom: '2px', paddingTop: '2px'}}>Play Tic-Tac-Toe on Bitcoin</h2>
        <TitleBar
          onStart={startGame}
          onCancel={cancelGame}
          started={gameData.start}
        />
        <Game gameData={gameData} setGameData={setGameData} setTxid = {currentTXID}  
        contract={contract} setContract={setContract} signerRef0={signerRef0} />

        {
          isConnected ?
            isPVTKEY?
                signAlice?
                      <div style={{ textAlign: 'center' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'Bob Address: ' + bobadd} 
                          </label>
                          <output id="output1"></output>


                          <button className="insert" onClick={pvtKeyTestBob}
                              style={{ fontSize: '12px', paddingBottom: '2px', marginLeft: '5px'}}
                          >Switch</button>
                          
                          <label htmlFor="output2" style={{ fontSize: '12px', paddingBottom: '5px', marginLeft: '20px' }}
                          
                          >Alice Address:
                              {' '+aliceadd}
                          </label>
                          <output id="output2"></output>
                        
                          <label style={{ fontSize: '12px', paddingBottom: '2px', marginLeft: '5px'}}
                          >Balance: {alicebalance} <span> (satoshis)</span></label>                          
                          
                      </div> 
                :
                      <div style={{ textAlign: 'center' }}>

                          <label htmlFor="output2" style={{ fontSize: '12px', paddingBottom: '5px'}}
                          >Alice Address:
                              {' '+aliceadd}
                          </label>
                          <output id="output2"></output>

                          <button className="insert" onClick={pvtKeyTestAlice}
                              style={{ fontSize: '12px', paddingBottom: '2px', marginLeft: '5px'}}
                          >Switch</button>


                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px', marginLeft: '20px'}}                           
                          >
                              {'Bob Address: ' + bobadd} 
                          </label>
                          <output id="output1"></output>
                          

                        
                          <label style={{ fontSize: '12px', paddingBottom: '2px', marginLeft: '5px'}}
                          >Balance: {alicebalance} <span> (satoshis)</span></label>                          
                          
                      </div>                   
              :
 
                      <div>
                          <label>Balance: {alicebalance} <span> (satoshis)</span></label>
                          
                      </div>
    
            :
            !isPVTKEY?
                <div>
                    <button
                      className="pure-button button-xsmall sensilet"
                      onClick={sensiletLogin}
                      style={{ paddingBottom: '2px', paddingTop: '2px' }}
                    >
                      Connect Wallet
                    </button>

                    <button
                      className="pure-button button-xsmall  PVTKEY"
                      onClick={pvtKeyPlace}
                      style={{ paddingBottom: '2px', paddingTop: '2px' , marginLeft: '20px' }}
                    >
                      Connect Pvt Keys
                    </button>
                </div>
                :
                      (isPVTKEYinsert)?
                      <div style={{ textAlign: 'center' }}>
                            <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                            >
                                {'Bob Address: ' + bobadd} 
                            </label>
                            <output id="output1"></output>


                            <button className="insert" onClick={pvtKeyTestBob}
                                style={{ fontSize: '12px', paddingBottom: '2px', marginLeft: '5px'}}
                            >Connect</button>
                            
                            <label htmlFor="output2" style={{ fontSize: '12px', paddingBottom: '5px', marginLeft: '20px' }}
                            
                            >Alice Address:
                                {' '+aliceadd}
                            </label>
                            <output id="output2"></output>

                            <button className="insert" onClick={pvtKeyTestAlice}
                                style={{ fontSize: '12px', paddingBottom: '2px', marginLeft: '5px'}}
                            >Connect</button>
                            

                      </div>              
                      :

                      <div>

                      <div style={{ display: 'inline-block', textAlign: 'center' }}>
                          <label style={{ fontSize: '14px', paddingBottom: '5px' }}
                          
                          >Bob Pvt Key:
                              <input ref={bobpvtkey} type="hex" name="PVTKEY1" min="1" defaultValue={'64 hex char'} placeholder="hex" />
                          </label>
                          
                          <label style={{ fontSize: '14px', paddingBottom: '5px', marginLeft: '20px' }}
                          
                          >Alice Pvt Key:
                              <input ref={alicepvtkey} type="hex" name="PVTKEY2" min="1" defaultValue={'64 hex char'} placeholder="hex" />
                          </label>
                          
                      </div>
                      <div style={{ display: 'inline-block', textAlign: 'center' }}>
                          
                          <button className="insert" onClick={pvtKeyTest}
                              style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                          >Insert</button>

                      </div>
                      </div>                      
        }
      </header>
    </div>
  );
}

export default App;
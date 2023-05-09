import { useState } from "react";
import Board from './Board';
import { TicTacToe } from "./contracts/ticTacToe";
import { GameData, SquareData } from "./types";
import { Utils } from "./utils";
import { bsv, ContractTransaction, buildPublicKeyHashScript, hash160, Sig, SignatureResponse, 
  SmartContract, findSig, MethodCallOptions, toHex, DefaultProvider, TestWallet, sha256 } from 'scrypt-ts';

const calculateWinner = (squares: any) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[b] && squares[c] && squares[a].label === squares[b].label && squares[a].label === squares[c].label) {
      return { winner: squares[a], winnerRow: lines[i] };
    }
  }

  return { winner: null, winnerRow: null };
};


function Game(props: any) {  

  const gameData = props.gameData as GameData;
  const setGameData = props.setGameData;

  const [lastTxId, setLastTxId] = useState<string>(gameData.currentTXID)
  
  function canMove(i: number, squares: any) {
    if (!gameData.start) {
      alert("Please start the game!");
      return;
    }

    if (calculateWinner(squares).winner || squares[i]) {
      return false;
    }

    return true;
  }

  async function isRightSensiletAccount() {
    const current = props.contract as TicTacToe;
    /*
    const expe
    
    ctedPubkey = current.is_alice_turn ? props.alicePubkey : props.bobPubkey;
    
    const pubkey = await current.signer.getDefaultPubKey();

    return toHex(pubkey) === expectedPubkey;
    */
  }

  const [currentInst0, setContractInst] = useState<TicTacToe>(props.contract)
  const [gameStart, setgameStart] = useState(false);

  let currentInst = props.contract as TicTacToe;

  async function isRightAccountVerify() {

    if(gameStart){
      currentInst = currentInst0
    }
    
    await currentInst.connect(props.signerRef0)
    
    console.log('Table: ', currentInst.board)
    
    //const expectedPubkey = current.is_alice_turn ? props.alicePubkey : props.bobPubkey;
    const expectedPubkey = currentInst.is_alice_turn ? currentInst.alice : currentInst.bob;
    
    const pubkey = await currentInst.signer.getDefaultPubKey();

    return toHex(pubkey) === expectedPubkey;    
  }


  const provider = new DefaultProvider({network: bsv.Networks.testnet});

  async function move(i: number, latestGameData: GameData) {
    await provider.connect()

    let tx3 = new bsv.Transaction
    tx3 = await provider.getTransaction(latestGameData.currentTXID);

    if(gameStart){
      currentInst = currentInst0
    }

    const nextInstance = currentInst.next();

  //  const initBalance = current.from?.tx.outputs[current.from?.outputIndex].satoshis as number;
    const initBalance = Number(currentInst.balance);

    // update nextInstance state
    Object.assign(nextInstance, Utils.toContractState(latestGameData)); //muda o quadro do next state

    //current.bindTxBuilder('move', async (current: TicTacToe, options: MethodCallOptions<SmartContract>, n: bigint, sig: Sig) => {
    currentInst.bindTxBuilder('move', async () => {  
    
      let play = currentInst.is_alice_turn ? TicTacToe.ALICE : TicTacToe.BOB;

      //Atualização de NextInstance Não é necessária pois é feita antes

      //nextInstance.board[Number(i)] = play;
      //nextInstance.board[i] = play;

      //nextInstance.is_alice_turn = !nextInstance.is_alice_turn;

      const changeAddress = await currentInst.signer.getDefaultAddress();
    
      const unsignedTx: bsv.Transaction = new bsv.Transaction()
        //.addInputFromPrevTx(current.from?.tx as bsv.Transaction, current.from?.outputIndex)
        .addInputFromPrevTx(tx3, 0)
        //.from(options.utxos);  

      if (nextInstance.won(play)) {

        unsignedTx.addOutput(new bsv.Transaction.Output({
          script: currentInst.is_alice_turn ? buildPublicKeyHashScript(hash160(currentInst.alice)) : buildPublicKeyHashScript(hash160(currentInst.bob)),
          satoshis: initBalance
        }))
        .change(changeAddress)

        return Promise.resolve({
          tx: unsignedTx,
          atInputIndex: 0,
          nexts: [

          ]
        }) as Promise<ContractTransaction>

      } else if (nextInstance.full()) {

        const halfAmount = initBalance / 2

        unsignedTx.addOutput(new bsv.Transaction.Output({
          script: buildPublicKeyHashScript(hash160(currentInst.alice)),
          satoshis: halfAmount
        }))
        .addOutput(new bsv.Transaction.Output({
          script: buildPublicKeyHashScript(hash160(currentInst.bob)),
          satoshis: halfAmount
        }))
        .change(changeAddress)


        return Promise.resolve({
          tx: unsignedTx,
          atInputIndex: 0,
          nexts: [

          ]
        }) as Promise<ContractTransaction>
      } else {

        unsignedTx.addOutput(new bsv.Transaction.Output({
          script: nextInstance.lockingScript,
          satoshis: initBalance,
        }))
        .change(changeAddress)

        return Promise.resolve({
          tx: unsignedTx,
          atInputIndex: 0,
          nexts: [
            /*{
              instance: nextInstance,
              atOutputIndex: 0,
              balance: initBalance
            }
            */
            
          ]
        }) as Promise<ContractTransaction>
      }
    });

  
    const pubKey = currentInst.is_alice_turn ? currentInst.alice : currentInst.bob;

    return currentInst.methods.move(
      BigInt(i),
      (sigResponses: SignatureResponse[]) => {
        return findSig(sigResponses, bsv.PublicKey.fromString(pubKey))
      },
      {
        pubKeyOrAddrToSign: bsv.PublicKey.fromString(pubKey),
      } as MethodCallOptions<TicTacToe>)
    
      
  }

  async function handleClick(i: number) {
    const history = gameData.history.slice(0, gameData.currentStepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();


    if(!gameStart)
    {
      setContractInst(props.contract)
      setgameStart(true)
    }
    
    //const isRightAccount = await isRightSensiletAccount();
    const isRightAccount = await isRightAccountVerify();

    /*
    if (!isRightAccount) {
      alert(`Please switch Sensilet to ${gameData.isAliceTurn ? "Alice" : "Bob"} account!`)
      return;
    }
    */
    
    if (!isRightAccount) {
      alert(`Please switch Account to ${gameData.isAliceTurn ? "Alice" : "Bob"} account!`)
      return;
    }  

    if (!canMove(i, squares)) {
      console.error('can not move now!')
      return;
    }

    squares[i] = {
      label: gameData.isAliceTurn ? 'X' : 'O',
      n: history.length 
    };

    let winner = calculateWinner(squares).winner;

    const gameData_ = {
      ...gameData,
      history: history.concat([
        {
          squares
        },
      ]),
      isAliceTurn: winner ? gameData.isAliceTurn : !gameData.isAliceTurn,
      currentStepNumber: history.length,
      start: true
    }

   
    const {tx, nexts} = await move(i, gameData_);

    console.log('New TXID: ', tx.id)

    try {
      currentInst = TicTacToe.fromTx(tx, 0)
      setContractInst(currentInst)
     
    } catch (error) {
      //console.error("sensiletLogin failed", error);
      //alert("sensiletLogin failed")
      console.log("finished");
    }


    if(nexts && nexts[0]) {
      props.setContract(nexts[0].instance)
    }


    const square = squares[i] as SquareData;
    if(square) {
      square.tx = tx.id;
    }

    gameData_.currentTXID = tx.id;
    setGameData(gameData_)

    //gameData.currentTXID = tx.id;
    setLastTxId(tx.id)    
  }

  const { history } = gameData;
  const current = history[gameData.currentStepNumber];
  const { winner, winnerRow } = calculateWinner(current.squares);


  let status;
  let icon;


  if (!gameData.isAliceTurn) {
    icon = <div className="bob" > Bob <img src="/tic-tac-toe/bob.png" alt="" /></div>
  } else {
    icon = <div className="alice" > Alice <img src="/tic-tac-toe/alice.jpg" alt="" /></div>
  }

  if (winner) {
    let winnerName = winner.label === 'X' ? 'Alice' : 'Bob';
    status = `Winner is ${winnerName}`;
  } else if (history.length === 10) {
    status = 'Draw. No one won.';
  } else {

    let nexter = gameData.isAliceTurn ? 'Alice' : 'Bob';

    status = `Next player: ${nexter}`;
  }

  return (
    <div className="game" >
      <div className="game-board" >

        <div className="game-title" >
          {icon}
          < div className="game-status" > {status} </div>
        </div>

        < Board
          squares={current.squares}
          winnerSquares={winnerRow}
          onClick={handleClick}
        />

        <div className="game-bottom" >
          {props.deployedTxId ? <div className="bet"><a href={Utils.getTxUri(props.deployedTxId)} target="_blank" rel="noreferrer" >Deploy transaction</a> </div> : undefined}
          {winner || history.length === 10 ? <div className="end"><a href={Utils.getTxUri(lastTxId)} target="_blank" rel="noreferrer" >Withdraw transaction</a> </div> : undefined }
        </div>
      </div>
    </div>);
}

export default Game;
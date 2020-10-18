import React, { useRef, useState } from 'react';
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firebaseConf } from './ApiKey';

const firebaseConfig = firebaseConf;

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header><h1>⚛️🔥💬</h1><SignOut/></header>
       <section>{user ? <ChatRoom /> : <SignIn />}</section>  
    </div>
  );
}

function SignIn() {
  const signItWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <>
    <button onClick={signItWithGoogle}>Iniciar sesión con Google</button>;
    <p>¡No viole las pautas de la comunidad o será expulsado de por vida!</p>
    </>
  )
}

function SignOut() {
  return (
    auth.currentUser && <button className ="sign-out" onClick={() => auth.signOut()}>Cerrar Sesión</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const query = firestore.collection("messages")
    .orderBy("createdAt")
    .limitToLast(30);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await firestore.collection("messages").add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

  setFormValue('');
  dummy.current.scrollIntoView({behaviour: 'smooth'});

  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Di algo cool" />
      <button type="submit" disabled={!formValue}>🕊️</button>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}/>
      <p>{text}</p>
    </div>
    </>
  )
}
export default App;

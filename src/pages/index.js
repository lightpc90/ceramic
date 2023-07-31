
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Provider } from "@ethersproject/providers";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { useViewerConnection, useViewerRecord } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";
import { Container, Spacer, Text, Grid, Button, Input, Loading } from '@nextui-org/react';
import Footer from '@/Components/Footer';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [connection, connect, disconnect] = useViewerConnection();
  const web3ModalRef = useRef();

  const getProvider = async () => {
    const provider = await web3ModalRef.current.connect();
    const wrappedProvider = new Web3Provider(provider);
    return wrappedProvider;
  };

  useEffect(() => {
    console.log('status of connection: ', connection.status)
    if (connection.status !== "connected") {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  };
  
  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

  return (
    <div>
      <Container css={{p: '0', minHeight: '90vh'}} >
    <div className={styles.navbar}>
      <span className={styles.title}>Ceramic Demo</span>
      {connection.status === "connected" ? (
        <span className={styles.subtitle}>Connected</span>
      ) : (
        <button
          onClick={connectToSelfID}
          className={styles.button}
          disabled={connection.status === "connecting"}
        >
          Connect Wallet
        </button>
      )}
    </div>

    <div >
      <div>
        {connection.status === "connected" ? (
          <>
          <Container display='flex' justify='center' css={{p: '$8'}}>
              <Text>Your 3ID is: </Text> 
              <Text b color='primary' css={{ overflow: "hidden", wordWrap: "break-word"}}>{connection.selfID.id}</Text>
               <Spacer/>
            </Container>
            <RecordSetter />
          </>
            
        ) : (
          <Container align='center' >
            Connect with your wallet to access your 3ID
          </Container>
        )}
      </div>
    </div>
  </Container>
  <Footer/>
    </div>
    
  )
}


function RecordSetter() { 
  const record = useViewerRecord("basicProfile");
  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false)

  const updateRecordName = async (name) => {
    setUpdating(true)
    await record.merge({
      name: name,
    });
    setName('')
    setUpdating(false)
  };

  return (
    <div >
      <div >
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>Hello {record.content.name}!</span>
  
            <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <div className={styles.flexCol}>
            <span>
              You do not have a profile record attached to your 3ID. Create a basic
              profile by setting a name below.
            </span>
          </div>
          
        )}
      </div>
      <Spacer/>
      <Grid.Container justify='center' alignItems='center' gap={1}>
        <Grid>
          <Input
          color='primary'
          bordered
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid>
        {updating ? (<>
          <Button disabled auto bordered color="primary" css={{ px: "$13" }}><Loading type='spinner' color='currentColor' size='sm'/></Button>
          </>):(<>
            <Button size='xs' onClick={() => updateRecordName(name)}>Update</Button>
          </>)}
        </Grid>
     
      </Grid.Container>
      
      
    </div>
  );
}


